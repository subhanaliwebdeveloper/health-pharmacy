# 🏥 Comprehensive Code Review & Security Audit Report
**Project:** Health Pharmacy Management System  
**Stack:** Node.js, Express.js, MySQL (mysql2/promise), React 18, Vite 6, Tailwind CSS, Bootstrap 5  
**Scope:** `backend/`, `frontend/`, `admin/`, `database/`  
**Date:** September 2026  
**Auditor:** Antigravity AI Senior Security & Systems Architect  

---

## 📋 Executive Summary

A comprehensive, end-to-end security, architectural, and quality audit was conducted on the Health Pharmacy Management System codebase. The application provides an e-commerce pharmacy experience for customers and a back-office administration suite for pharmacists/store managers.

While the application demonstrates modern front-end styling and clean UI components, the system contains **critical architectural, regulatory, and security vulnerabilities** that must be resolved prior to processing real customer orders or handling medical health data.

### Key Severity Breakdown

| Severity | Count | Primary Impact Areas |
| :--- | :---: | :--- |
| 🔴 **Critical** | 7 | Process crashes on unhandled errors, public PHI exposure, missing prescription-order enforcement, hardcoded fallback JWT secrets, serverless file upload failure, unvalidated order quantities, settings fee overwrite |
| 🟠 **High** | 6 | Client hammering polling loops, lack of rate limiting, missing DB indexes, lack of medicine batch/expiry tracking, CORS crash on unauthorized origins, unhandled connection pool acquisition errors |
| 🟡 **Medium** | 5 | Inconsistent auth validation, bundle bloat (dual CSS frameworks), broken prescription image links in admin, missing search debounce, fake contact form |
| 🟢 **Low / Info** | 4 | Dangling scratch files, missing `"type": "module"` in package.json, alias route placeholders, unencrypted PII at rest |

---

## 📑 Detailed Table of Contents
1. [Backend & Database Review](#1-backend--database-review)
   - [1.1 SQL Injection & Query Architecture](#11-sql-injection--query-architecture)
   - [1.2 Authentication, Authorization & Session Management](#12-authentication-authorization--session-management)
   - [1.3 Error Handling & Process Stability (Unhandled Rejections)](#13-error-handling--process-stability-unhandled-rejections)
   - [1.4 Input Validation & Business Logic Loopholes](#14-input-validation--business-logic-loopholes)
   - [1.5 MySQL Connection Management & Pooling](#15-mysql-connection-management--pooling)
   - [1.6 Pharmacy-Specific Regulatory & Schema Flaws](#16-pharmacy-specific-regulatory--schema-flaws)
2. [Frontend Audit (Customer Store)](#2-frontend-audit-customer-store)
   - [2.1 State Management & Authentication Storage](#21-state-management--authentication-storage)
   - [2.2 Severe Polling & Re-render Performance Issue](#22-severe-polling--re-render-performance-issue)
   - [2.3 Checkout, Cart & Math Accuracy](#23-checkout-cart--math-accuracy)
   - [2.4 UI/UX, Assets & Dependency Bloat](#24-uiux-assets--dependency-bloat)
3. [Admin Panel Review](#3-admin-panel-review)
   - [3.1 Access Control & Route Guarding](#31-access-control--route-guarding)
   - [3.2 Prescription Review Pipeline & Cloudinary Link Bug](#32-prescription-review-pipeline--cloudinary-link-bug)
   - [3.3 Placeholder Pages & Redundant Files](#33-placeholder-pages--redundant-files)
4. [Deployment & Production Readiness](#4-deployment--production-readiness)
   - [4.1 Vercel Serverless Incompatibilities](#41-vercel-serverless-incompatibilities)
   - [4.2 Security Headers, Helmet & Rate Limiting](#42-security-headers-helmet--rate-limiting)
   - [4.3 Secrets Management & Git Hygiene](#43-secrets-management--git-hygiene)
5. [Actionable Remediation Checklist](#5-actionable-remediation-checklist)

---

## 1. Backend & Database Review

### 1.1 SQL Injection & Query Architecture
* **Status:** Mostly Parameterized, Architectural Vulnerabilities Present
* **Findings:**
  - The codebase primarily uses parameterized queries via `pool.query(sql, [params])` and `conn.query(sql, [params])`.
  - In `backend/src/controllers/productController.js`, dynamic sorting is allowlisted against an object mapping:
    ```javascript
    const order = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      popularity: 'p.sales_count DESC',
      newest: 'p.id DESC'
    }[sort] || 'p.id DESC';
    ```
    This prevents direct sort injection.
  - **Vulnerability Risk:** Dynamic `where` clause assembly uses manual string concatenation (`where += ' AND ...'`). While parameter placeholders `?` are currently pushed correctly, manual SQL string assembly in Express controllers without a query builder (such as Kysely or Knex) introduces a high probability of future SQL injection as new filters or developer modifications occur.

### 1.2 Authentication, Authorization & Session Management
* **Severity:** 🔴 CRITICAL
* **Files:** `backend/src/config/env.js`, `backend/src/middleware/authMiddleware.js`, `database/seed.js`
* **Findings:**
  1. **Hardcoded Fallback JWT Secret:**
     In `backend/src/config/env.js`:
     ```javascript
     jwt: process.env.JWT_SECRET || 'dev-secret'
     ```
     If the server is started in an environment where `JWT_SECRET` is missing or misconfigured, it defaults to the static string `'dev-secret'`. An attacker knowing this fallback can forge arbitrary JWT tokens with `{ id: 1, role: 'admin' }` and gain instant administrative root access to the entire pharmacy database.
  2. **Stateless Tokens Without Invalidation or User Verification:**
     In `authMiddleware.js`:
     ```javascript
     req.user = jwt.verify(h.slice(7), env.jwt);
     next();
     ```
     - The token payload is trusted blindly for 7 days (`7d`).
     - The middleware **never checks if the user still exists in the database**, nor if their account is disabled, suspended, or has had their password reset.
     - Logout is strictly client-side (`localStorage.removeItem`). There is no token blacklist/revocation table. If an admin or user token is intercepted or leaked, it remains valid until the 7-day expiration.
  3. **Hardcoded Seed Credentials:**
     `database/seed.js` seeds a default admin account with a publicly known password:
     `admin@healthpharmacy.pk` / `Admin@123`.

### 1.3 Error Handling & Process Stability (Unhandled Rejections)
* **Severity:** 🔴 CRITICAL
* **Files:** All controllers in `backend/src/controllers/`
* **Findings:**
  - **90% of Backend Routes Lack `try/catch`:**  
    In Node.js / Express 4.x, asynchronous errors thrown inside `async` route handlers do **not** automatically pass to the `errorHandler` middleware unless wrapped in `try/catch` or caught using an async wrapper (e.g. `express-async-errors`).
  - Example in `backend/src/controllers/productController.js`:
    ```javascript
    export async function list(req, res) {
      // No try / catch!
      const [rows] = await pool.query(...);
      res.json(rows);
    }
    ```
    If MySQL encounters a timeout, syntax error, lost connection, or memory pressure, an **unhandled promise rejection** occurs. In modern Node.js runtimes (Node 16+), this causes the entire server process to terminate (`ERR_UNHANDLED_REJECTION`), crashing the pharmacy platform for all concurrent users.
  - **Database Error Leakage in `errorMiddleware.js`:**
    ```javascript
    export function errorHandler(err, req, res, next) {
      console.error(err);
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
    ```
    Returning raw `err.message` discloses MySQL table structures, column names, duplicate key constraints, and database hostnames directly to API consumers.

### 1.4 Input Validation & Business Logic Loopholes
* **Severity:** 🔴 CRITICAL
* **Files:** `backend/src/controllers/orderController.js`, `settingsController.js`, `authController.js`
* **Findings:**
  1. **Negative / Non-Integer Order Quantities:**
     In `orderController.js`:
     ```javascript
     const price = Number(p.discount_price || p.price);
     subtotal += price * qty;
     await conn.query('UPDATE products SET stock=stock-?, sales_count=sales_count+? WHERE id=?', [x.qty, x.qty, x.p.id]);
     ```
     The endpoint does not validate that `item.quantity` is a positive integer greater than 0!
     - An attacker sending `quantity: -5` causes `subtotal += price * -5`, subtracting money from the order total.
     - `UPDATE products SET stock=stock-(-5)` increases inventory artificially.
  2. **Broken Settings Controller Overwrites Values with Zero:**
     In `backend/src/controllers/settingsController.js`:
     ```javascript
     export async function update(req, res) {
       const { store_name, support_phone, support_email, address, delivery_fee, free_delivery_threshold } = req.body;
       await ensureRow();
       await pool.query(
         'UPDATE settings SET store_name=?,support_phone=?,support_email=?,address=?,delivery_fee=?,free_delivery_threshold=? WHERE id=1',
         [store_name, support_phone, support_email, address, 0, 0] // <-- HARDCODED 0, 0!
       );
       res.json(await ensureRow());
     }
     ```
     When an admin updates store settings with custom delivery fees and free delivery thresholds, the query permanently forces both `delivery_fee` and `free_delivery_threshold` back to `0, 0`.
  3. **Weak Authentication Input Validation:**
     - Registration checks only `if (!name || !email || !password)`.
     - Passwords with only 1 character are permitted by the backend.
     - Email formats are not validated via regex or email validator.
     - Login query searches only `WHERE email=?`. If a user inputs a phone number (even though the frontend prompt says "Email or Phone"), the query fails.

### 1.5 MySQL Connection Management & Pooling
* **Severity:** 🟡 MEDIUM
* **Files:** `backend/src/config/db.js`, `backend/src/controllers/orderController.js`
* **Findings:**
  1. Connection pool in `db.js` sets `connectionLimit: 10`. Under concurrent checkout traffic, 10 connections can quickly exhaust, queuing requests until timeout.
  2. In `orderController.js`:
     ```javascript
     const conn = await pool.getConnection();
     try {
       await conn.beginTransaction();
       // ...
     } catch (e) {
       await conn.rollback();
       res.status(400).json({ message: e.message });
     } finally {
       conn.release();
     }
     ```
     `pool.getConnection()` is executed outside the `try` block. If the pool is exhausted or timed out, it produces an unhandled rejection outside the error block.

### 1.6 Pharmacy-Specific Regulatory & Schema Flaws
* **Severity:** 🔴 CRITICAL (Healthcare Compliance Failure)
* **Files:** `database/schema.sql`, `backend/src/controllers/orderController.js`
* **Findings:**
  1. **Zero Batch Number & Expiry Date Tracking:**
     - The `products` table has only `stock INT DEFAULT 0`.
     - In pharmaceutical operations, medicines are manufactured in specific batches (`batch_number` / `lot_number`) with individual manufacturing (`mfg_date`) and expiry (`expiry_date`) dates.
     - Dispensing expired medication violates drug administration regulations (e.g. DRAP, FDA, MHRA). There is currently no database representation to alert staff to near-expiry items or quarantine expired inventory.
  2. **Prescriptions Are Completely Disconnected From Orders:**
     - The `orders` table has NO foreign key or link to `prescriptions`.
     - An order containing items with `requires_prescription = 1` can be submitted, paid for, and fulfilled without providing or approving any prescription!
     - In `orderController.js`, `create()` does not verify whether any product in the cart requires a prescription, nor whether an approved prescription ID is attached.
  3. **Unprotected Personal Health Information (PHI):**
     - Uploaded prescriptions are saved into `backend/uploads/` and served statically via:
       `app.use('/uploads', express.static(path.join(__dirname, '../uploads')));`
     - Any internet user who guesses or enumerates the filename (e.g. `prescription-1712345678.jpg`) can download patient prescriptions, doctor diagnoses, and private clinical information without logging in!
  4. **Missing Medical Meta-Fields:**
     - No fields for prescribing doctor name, medical council registration / license number, clinic address, patient age, or dosage instructions.
  5. **Missing Database Indexes on High-Traffic Columns:**
     - `products`: Missing index on `active`, `category_id`, `price`, `sales_count`.
     - `orders`: Missing index on `status`, `created_at`, `user_id`.
     - `coupons`: Missing index on `expires_at`, `active`.

---

## 2. Frontend Audit (Customer Store)

### 2.1 State Management & Authentication Storage
* **Severity:** 🟡 MEDIUM
* **Files:** `frontend/src/context/AuthContext.jsx`, `CartContext.jsx`
* **Findings:**
  - Authentication token is saved in `localStorage` under `hp_token`.
  - Storing auth tokens in `localStorage` leaves customer sessions vulnerable to Cross-Site Scripting (XSS). Switching to secure, `HttpOnly`, `SameSite=Lax` cookies is the industry standard for healthcare and financial applications.
  - Cart state in `CartContext.jsx` operates purely client-side without synchronizing against the backend user profile. If a user switches devices, their cart is lost.

### 2.2 Severe Polling & Re-render Performance Issue
* **Severity:** 🟠 HIGH
* **File:** `frontend/src/hooks/useProducts.js`
* **Findings:**
  ```javascript
  // Automatically check for new products every 5 seconds
  const interval = setInterval(loadProducts, 5000);
  ```
  - `useProducts` executes a network poll every 5 seconds on any page using the hook (including the catalog page `Products.jsx`).
  - If 500 users browse the catalog, this generates **6,000 requests per minute** against the MySQL database.
  - Furthermore, in `frontend/src/pages/Products.jsx`, search updates on every single keystroke:
    ```javascript
    onChange={(value) => {
      setQ(value);
      updateParam("search", value);
    }}
    ```
    Typing a 10-character medicine name triggers 10 immediate HTTP requests without debounce, each firing a MySQL `LIKE %query%` query.

### 2.3 Checkout, Cart & Math Accuracy
* **Severity:** 🟠 HIGH
* **Files:** `frontend/src/pages/Checkout.jsx`, `backend/src/controllers/orderController.js`
* **Findings:**
  - `deliveryFee` is hardcoded to `0` in `Checkout.jsx`:
    ```javascript
    deliveryFee: 0
    ```
    Regardless of the store's configured delivery policy or order subtotal, delivery is forced to 0 on checkout.
  - In `frontend/src/pages/Register.jsx`:
    The form lacks a `busy` / `submitting` disabling state on the submit button. A user clicking "Sign Up" rapidly multiple times sends duplicate concurrent registration requests.

### 2.4 UI/UX, Assets & Dependency Bloat
* **Severity:** 🟡 MEDIUM
* **Files:** `frontend/package.json`, `frontend/src/index.css`
* **Findings:**
  1. **Dual CSS Framework Bloat:**
     The frontend installs and bundles **both** Tailwind CSS and Bootstrap 5:
     - `bootstrap: ^5.3.3`
     - `bootstrap-icons: ^1.11.3`
     - `tailwindcss: ^3.4.17`
     This bloats the production asset bundle with 134 KB WOFF2 icons, 180 KB WOFF icons, and 120 KB CSS, creating styling conflicts where Bootstrap class names compete with Tailwind utility classes.
  2. **Mock Contact Form:**
     In `frontend/src/pages/Contact.jsx`, form submission displays a success message via `setMsg("Thanks!...")` without transmitting the customer inquiry to any backend endpoint or email service. Customer inquiries are silently dropped.
  3. **Leftover Dead Code:**
     `frontend/src/components/common/Header.jsx.new` is an unreferenced duplicate file left in the repository.

---

## 3. Admin Panel Review

### 3.1 Access Control & Route Guarding
* **Severity:** 🟡 MEDIUM
* **Files:** `admin/src/App.jsx`, `admin/src/context/AuthContext.jsx`
* **Findings:**
  - Admin authentication checks `if (r.user.role !== 'admin') throw new Error('This account is not an admin')`.
  - Token is stored in `hp_admin_token`.
  - While top-level access requires login, nested admin routes in `AdminRoutes.jsx` do not enforce granular permissions (e.g. inventory manager vs super admin vs pharmacist reviewer).

### 3.2 Prescription Review Pipeline & Cloudinary Link Bug
* **Severity:** 🟠 HIGH
* **File:** `admin/src/components/PrescriptionViewer.jsx`
* **Findings:**
  ```javascript
  href={`${API.replace('/api', '')}${p.image_url}`}
  ```
  - When a customer uploads a prescription via Cloudinary, `p.image_url` is a full URL:  
    `https://res.cloudinary.com/demo/image/upload/v1234/prescription.jpg`
  - The link rendering logic prepends `${API.replace('/api', '')}`, resulting in:  
    `http://localhost:5000https://res.cloudinary.com/...`
  - Clicking "View Image" fails with an invalid URL error in the admin browser.

### 3.3 Placeholder Pages & Redundant Files
* **Severity:** 🟢 LOW
* **Files:** `admin/src/pages/AddProduct.jsx`, `EditProduct.jsx`, `OrderDetails.jsx`
* **Findings:**
  - `AddProduct.jsx` and `EditProduct.jsx` are 1-line re-exports of `Products.jsx`.
  - `OrderDetails.jsx` is a 1-line re-export of `Orders.jsx`.
  - These redundant files should be cleaned up to avoid routing confusion.

---

## 4. Deployment & Production Readiness

### 4.1 Vercel Serverless Incompatibilities
* **Severity:** 🔴 CRITICAL
* **Files:** `backend/src/server.js`, `backend/src/middleware/uploadMiddleware.js`
* **Findings:**
  - The server attempts serverless readiness via `if (!process.env.VERCEL) app.listen(...)`.
  - However:
    1. **No `vercel.json` exists** in the repository root or `backend/`. Vercel does not know how to route API endpoints to `backend/src/server.js`.
    2. **Local Multer File Storage on Serverless Runtimes:**  
       `backend/src/middleware/uploadMiddleware.js` saves files to `backend/uploads/`. Vercel lambdas run on read-only ephemeral file systems (`/tmp` only, wiped after execution). Any local file upload will crash with `EROFS` (read-only file system) or disappear after seconds.
    3. **CORS Configuration Blocks Vercel Previews:**  
       `allowedOrigins` only permits specific localhost ports and static env URLs. Dynamic preview URLs generated by Vercel (`*-subhanaliwebdeveloper.vercel.app`) are rejected.
    4. **CORS Error Rejection Kills Requests with HTTP 500:**
       ```javascript
       return callback(new Error(`CORS blocked for origin: ${origin}`));
       ```
       Passing an error to the CORS callback causes Express to return a 500 internal server error with full stack trace instead of an HTTP 403 Forbidden or clean CORS rejection.

### 4.2 Security Headers, Helmet & Rate Limiting
* **Severity:** 🟠 HIGH
* **Files:** `backend/src/server.js`
* **Findings:**
  - **No `helmet`:** Missing standard HTTP security headers (X-Frame-Options, Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options).
  - **No Rate Limiting:** The API has no brute-force defense on authentication (`/api/auth/login`, `/api/auth/register`) or coupon validation (`/api/coupons/validate`).

### 4.3 Secrets Management & Git Hygiene
* **Severity:** 🟡 MEDIUM
* **Files:** `backend/.env`, `frontend/.env.example`, `admin/.env.example`
* **Findings:**
  - `.env` files are properly listed in `.gitignore` and are not committed in git history.
  - `backend/.env.example` provides sample keys, but `JWT_SECRET` in `backend/.env` is set to a placeholder string.
  - `admin/package.json` and `frontend/package.json` are missing `"type": "module"`, generating PostCSS/Vite build warnings.

---

## 5. Actionable Remediation Checklist

### 🔴 Phase 1: Immediate Critical Fixes (Security & Stability)
- [ ] **Install `express-async-errors`:** Add `import 'express-async-errors';` at top of `server.js` or wrap all async controllers in an `asyncHandler` wrapper so unhandled errors never crash the Node process.
- [ ] **Enforce Strong Fallback JWT:** Remove `'dev-secret'` fallback in `env.js`. Throw an explicit exception on startup if `JWT_SECRET` is missing in production.
- [ ] **Validate Order Quantities:** In `orderController.js`, reject non-positive integers:
  ```javascript
  if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }
  ```
- [ ] **Link Prescriptions to Orders:**
  - Add `prescription_id INT NULL` to `orders` table.
  - If any product in cart has `requires_prescription = 1`, require a valid `prescription_id` with `status = 'approved'` before order placement.
- [ ] **Fix Settings Controller Overwrite:**
  Replace hardcoded `0, 0` in `settingsController.js` with `Number(delivery_fee || 0)` and `Number(free_delivery_threshold || 0)`.
- [ ] **Protect Prescription Uploads (PHI):**
  Remove public `express.static('/uploads')` for prescriptions. Serve prescription images through an authenticated route (`/api/prescriptions/:id/file`) verifying `req.user.role === 'admin' || req.user.id === prescription.user_id`.

### 🟠 Phase 2: Performance & Frontend Polish
- [ ] **Remove 5-Second Polling:** Eliminate `setInterval` inside `frontend/src/hooks/useProducts.js`. Refresh catalog only on filter changes or manual refresh.
- [ ] **Add Debounce to Search Input:** Implement a 300ms debounce in `Products.jsx` before updating query params.
- [ ] **Fix Admin Prescription Image Links:** In `PrescriptionViewer.jsx`:
  ```javascript
  href={p.image_url.startsWith('http') ? p.image_url : `${API.replace('/api','')}${p.image_url}`}
  ```
- [ ] **Add Rate Limiting:** Implement `express-rate-limit` on `/api/auth/*` and `/api/coupons/validate`.
- [ ] **Add `helmet` Security Middleware:** Install and invoke `helmet()` in `server.js`.

### 🟡 Phase 3: Pharmacy Domain & Schema Maturation
- [ ] **Add Batch & Expiry Tracking:**
  Create a `product_batches` table:
  ```sql
  CREATE TABLE product_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    mfg_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
  ```
- [ ] **Add Essential Database Indexes:**
  ```sql
  CREATE INDEX idx_products_active_cat ON products(active, category_id);
  CREATE INDEX idx_orders_user_status ON orders(user_id, status);
  CREATE INDEX idx_prescriptions_user_status ON prescriptions(user_id, status);
  ```
- [ ] **Clean Redundant Code:** Remove `Header.jsx.new` and consolidate placeholder admin pages.

---
*Report compiled autonomously by Antigravity IDE Code Review Subsystem.*
