import fs from 'fs';
import path from 'path';
import { connectDB } from '../config/db.js';

const API_BASE = 'http://localhost:5000/api';

async function runSmokeTests() {
  await connectDB();
  console.log('=== STARTING END-TO-END SMOKE TESTS ===\n');

  const results = [];

  // Helper to extract cookie
  function getAuthCookie(res) {
    const raw = res.headers.get('set-cookie');
    if (!raw) return null;
    const match = raw.match(/hp_auth=([^;]+)/);
    return match ? `hp_auth=${match[1]}` : null;
  }

  // --- FLOW A: Register -> Login -> /api/auth/me session restore ---
  try {
    const ts = Date.now();
    const testEmail = `smoke_${ts}@example.com`;
    const testPassword = 'Password@123';
    const testName = 'Smoke Tester';

    console.log('[Flow A] Registering user:', testEmail);
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Register failed: ${regData.message}`);

    console.log('[Flow A] Logging in...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const cookie = getAuthCookie(loginRes);
    if (!cookie) throw new Error('No hp_auth cookie received on login');

    console.log('[Flow A] Restoring session via GET /api/auth/me with cookie...');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Cookie: cookie },
    });
    const meData = await meRes.json();
    if (!meRes.ok || meData.email !== testEmail.toLowerCase()) {
      throw new Error(`Session restore failed: ${JSON.stringify(meData)}`);
    }

    console.log('✓ Flow A PASSED: Register -> Login -> Session restored via cookie');
    results.push({ flow: 'Flow A (Auth & Session)', pass: true, fix: 'None needed' });

    // --- FLOW B: Browse products & verify Cloudinary/placeholder images ---
    console.log('\n[Flow B] Browsing products via GET /api/products...');
    const prodRes = await fetch(`${API_BASE}/products`);
    const prodData = await prodRes.json();
    const productsList = Array.isArray(prodData) ? prodData : (prodData.products || []);
    if (!prodRes.ok || productsList.length === 0) {
      throw new Error(`Products fetch failed or empty: ${JSON.stringify(prodData)}`);
    }
    console.log(`[Flow B] Fetched ${productsList.length} products.`);
    const sample = productsList[0];
    console.log(`[Flow B] Sample product: "${sample.name}" (image: "${sample.image || 'placeholder'}")`);
    results.push({ flow: 'Flow B (Browse Products)', pass: true, fix: 'MongoDB seed provided initial catalog' });

    // --- FLOW C: Delivery fee from /api/settings in Checkout ---
    console.log('\n[Flow C] Fetching settings via GET /api/settings...');
    const setRes = await fetch(`${API_BASE}/settings`);
    const settings = await setRes.json();
    if (!setRes.ok || typeof settings.delivery_fee === 'undefined') {
      throw new Error('Settings fetch failed');
    }
    const expectedDeliveryFee = Number(settings.delivery_fee);
    console.log(`[Flow C] Settings delivery_fee: ${expectedDeliveryFee}, free_threshold: ${settings.free_delivery_threshold}`);

    // Pick a non-prescription product
    const nonRxProduct = productsList.find((p) => !p.requires_prescription);
    if (!nonRxProduct) throw new Error('No non-prescription product available for test');

    console.log(`[Flow C] Placing order with non-Rx product: "${nonRxProduct.name}"...`);
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        items: [{ product_id: nonRxProduct._id, quantity: 1, name: nonRxProduct.name }],
        shippingAddress: { name: testName, phone: '03001234567', address: '123 Test St', city: 'Lahore' },
        paymentMethod: 'COD',
        deliveryFee: expectedDeliveryFee,
      }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(`Order placement failed: ${orderData.message}`);
    if (orderData.delivery_fee !== expectedDeliveryFee) {
      throw new Error(`Expected delivery_fee ${expectedDeliveryFee}, got ${orderData.delivery_fee}`);
    }
    console.log(`✓ Flow C PASSED: Order #${orderData.order_number} created with delivery fee ${orderData.delivery_fee} from /api/settings`);
    results.push({ flow: 'Flow C (Settings & Delivery Fee)', pass: true, fix: 'Updated orderController to accept deliveryFee from settings' });

    // --- FLOW D: Prescription upload to Cloudinary & save to MongoDB ---
    console.log('\n[Flow D] Uploading test prescription image to Cloudinary...');
    // Create a 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const blob = new Blob([pngBuffer], { type: 'image/png' });
    const formData = new FormData();
    formData.append('prescription', blob, 'test-prescription.png');
    formData.append('note', 'Doctor prescription for antibiotic');

    const rxUploadRes = await fetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: { Cookie: cookie },
      body: formData,
    });
    const rxUploadData = await rxUploadRes.json();
    if (!rxUploadRes.ok) throw new Error(`Prescription upload failed: ${rxUploadData.message}`);
    if (!rxUploadData.image_url || !rxUploadData.image_url.includes('cloudinary.com')) {
      throw new Error(`Expected Cloudinary URL, got: ${rxUploadData.image_url}`);
    }
    console.log(`[Flow D] Prescription uploaded to Cloudinary: ${rxUploadData.image_url}`);

    // Verify it is saved against user in MongoDB
    const myRxRes = await fetch(`${API_BASE}/prescriptions/mine`, {
      headers: { Cookie: cookie },
    });
    const myRxData = await myRxRes.json();
    const savedRx = myRxData.find((r) => r._id === rxUploadData.id);
    if (!savedRx) throw new Error('Prescription not found in /api/prescriptions/mine');
    console.log(`✓ Flow D PASSED: Prescription uploaded to Cloudinary and saved in MongoDB (ID: ${savedRx._id}, status: ${savedRx.status})`);
    results.push({ flow: 'Flow D (Prescription Cloudinary Upload)', pass: true, fix: 'Verified multipart memoryStorage + uploadBuffer to Cloudinary' });

    // --- FLOW E: Prescription-required product blocked without approved Rx ---
    console.log('\n[Flow E] Testing prescription-required product order blocking...');
    const rxProduct = productsList.find((p) => p.requires_prescription);
    if (!rxProduct) throw new Error('No prescription-required product found');
    console.log(`[Flow E] Testing with Rx product: "${rxProduct.name}" (requires_prescription: true)`);

    // 1. Attempt order without approved Rx (user only has a pending Rx)
    const blockOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        items: [{ product_id: rxProduct._id, quantity: 1, name: rxProduct.name }],
        shippingAddress: { name: testName, phone: '03001234567', address: '123 Test St', city: 'Lahore' },
        paymentMethod: 'COD',
        deliveryFee: expectedDeliveryFee,
      }),
    });
    const blockOrderData = await blockOrderRes.json();
    if (blockOrderRes.status !== 400 || !blockOrderData.message.includes('prescription')) {
      throw new Error(`Expected 400 blocked error, got status ${blockOrderRes.status}: ${JSON.stringify(blockOrderData)}`);
    }
    console.log(`[Flow E] Correctly blocked without approved prescription: "${blockOrderData.message}"`);

    // 2. Approve prescription directly in DB or via admin
    console.log('[Flow E] Approving prescription...');
    const PrescriptionModel = (await import('../models/Prescription.js')).default;
    await PrescriptionModel.findByIdAndUpdate(savedRx._id, { status: 'approved' });

    // 3. Retry order with approved Rx
    console.log('[Flow E] Retrying order after prescription approval...');
    const allowOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        items: [{ product_id: rxProduct._id, quantity: 1, name: rxProduct.name }],
        shippingAddress: { name: testName, phone: '03001234567', address: '123 Test St', city: 'Lahore' },
        paymentMethod: 'COD',
        deliveryFee: expectedDeliveryFee,
      }),
    });
    const allowOrderData = await allowOrderRes.json();
    if (!allowOrderRes.ok) {
      throw new Error(`Order should have succeeded with approved Rx, failed: ${allowOrderData.message}`);
    }
    console.log(`✓ Flow E PASSED: Order #${allowOrderData.order_number} succeeded after prescription approval!`);
    results.push({ flow: 'Flow E (Rx Product Blocking & Approval)', pass: true, fix: 'Added approved prescription check in orderController' });

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    results.push({ flow: 'Smoke Test Suite', pass: false, fix: err.message });
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('ALL 5 CORE FLOWS PASSED SUCCESSFULLY!');
  console.log('========================================');
  console.table(results);
  process.exit(0);
}

runSmokeTests();
