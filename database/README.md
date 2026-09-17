# Database setup
1. Create MySQL database/tables: `mysql -u root -p < schema.sql`
2. Copy `backend/.env.example` to `backend/.env` and set DB credentials.
3. From backend folder run `npm install` then `npm run seed`.
4. Admin seed login: `admin@healthpharmacy.pk` / `Admin@123` (change it immediately).
