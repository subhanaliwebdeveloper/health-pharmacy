import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';

async function seed() {
  await connectDB();

  console.log('Seeding initial MongoDB data...');

  // 1. Settings
  await Settings.getSingleton();

  // 2. Admin User
  const adminEmail = 'admin@healthpharmacy.pk';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Pharmacy Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin user created: admin@healthpharmacy.pk / Admin@123');
  }

  // 3. Categories
  const categoryNames = [
    'Pain Relief',
    'Vitamins & Supplements',
    'Cough & Cold',
    'Diabetes Care',
    'Skin Care',
    'Baby Care',
    'Personal Care',
    'First Aid',
    'Medical Devices',
  ];

  const categoryMap = {};
  for (const name of categoryNames) {
    let cat = await Category.findOne({ name });
    if (!cat) {
      cat = await Category.create({ name });
    }
    categoryMap[name] = cat._id;
  }
  console.log(`Categories ensured: ${Object.keys(categoryMap).length}`);

  // 4. Products
  const sampleProducts = [
    {
      name: 'Paracetamol 500mg',
      description: 'Relieves mild to moderate pain and reduces fever.',
      price: 20,
      discount_price: 18,
      categoryName: 'Pain Relief',
      brand: 'Health Pharma',
      image: '',
      sku: 'PARA-500',
      requires_prescription: false,
      batches: [{ batch_number: 'B-PARA-01', stock_qty: 120, expiry_date: new Date('2027-12-31') }],
    },
    {
      name: 'Ibuprofen 400mg',
      description: 'Pain and inflammation relief.',
      price: 45,
      discount_price: 40,
      categoryName: 'Pain Relief',
      brand: 'CareMed',
      image: '',
      sku: 'IBU-400',
      requires_prescription: false,
      batches: [{ batch_number: 'B-IBU-01', stock_qty: 80, expiry_date: new Date('2027-06-30') }],
    },
    {
      name: 'Vitamin C 500mg',
      description: 'Daily vitamin C supplement.',
      price: 350,
      discount_price: 320,
      categoryName: 'Vitamins & Supplements',
      brand: 'VitaWell',
      image: '',
      sku: 'VIT-C-500',
      requires_prescription: false,
      batches: [{ batch_number: 'B-VITC-01', stock_qty: 60, expiry_date: new Date('2028-01-15') }],
    },
    {
      name: 'Cough Syrup',
      description: 'Soothing cough and cold formula.',
      price: 220,
      discount_price: 199,
      categoryName: 'Cough & Cold',
      brand: 'MediCare',
      image: '',
      sku: 'COUGH-01',
      requires_prescription: false,
      batches: [{ batch_number: 'B-COUGH-01', stock_qty: 45, expiry_date: new Date('2026-11-30') }],
    },
    {
      name: 'Multivitamins',
      description: 'Complete daily multivitamin support.',
      price: 450,
      discount_price: 399,
      categoryName: 'Vitamins & Supplements',
      brand: 'NutriLife',
      image: '',
      sku: 'MULTI-01',
      requires_prescription: false,
      batches: [{ batch_number: 'B-MULTI-01', stock_qty: 70, expiry_date: new Date('2027-09-30') }],
    },
    {
      name: 'Amoxicillin 500mg',
      description: 'Prescription antibiotic. Use only as directed.',
      price: 120,
      discount_price: 110,
      categoryName: 'Pain Relief',
      brand: 'PharmaPlus',
      image: '',
      sku: 'AMOX-500',
      requires_prescription: true,
      batches: [{ batch_number: 'B-AMOX-01', stock_qty: 30, expiry_date: new Date('2026-08-31') }],
    },
  ];

  for (const p of sampleProducts) {
    const existing = await Product.findOne({ sku: p.sku });
    if (!existing) {
      await Product.create({
        name: p.name,
        description: p.description,
        price: p.price,
        discount_price: p.discount_price,
        category: categoryMap[p.categoryName],
        brand: p.brand,
        image: p.image,
        sku: p.sku,
        requires_prescription: p.requires_prescription,
        batches: p.batches,
      });
      console.log(`Product created: ${p.name}`);
    }
  }

  console.log('Seed completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
