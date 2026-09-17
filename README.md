# Health Pharmacy E-Commerce

Complete pharmacy e-commerce starter with a customer storefront, admin dashboard, Express/MySQL API, database schema and seed data.

## Structure
- `frontend` — customer website (React + Vite)
- `admin` — admin dashboard (React + Vite)
- `backend` — Node.js + Express API
- `database` — MySQL schema and seed script
- `docs` — requirements and design reference

## Run locally

### 1. Backend
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```
Set your MySQL credentials in `.env`, create the database using `database/schema.sql`, then seed with:
```bash
npm run seed
```

### 2. Frontend
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```
Open http://localhost:5173

### 3. Admin
```bash
cd admin
copy .env.example .env
npm install
npm run dev
```
Open http://localhost:5174

Admin seed login:
- Email: `admin@healthpharmacy.pk`
- Password: `Admin@123`

## Important
The React/Vite setup is pinned to compatible versions and includes explicit Vite React configuration. JSX files also import React so the project does not depend on an implicit JSX runtime.
