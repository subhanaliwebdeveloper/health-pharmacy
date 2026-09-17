-- Migration for the existing health_pharmacy database.
-- Safe to run multiple times. Does not delete any existing data.
USE health_pharmacy;

-- 1) Align existing order status values with the new customer-facing tracking flow:
--    Order Placed -> Confirmed -> Preparing -> Out for Delivery -> Delivered
UPDATE orders SET status = 'preparing' WHERE status = 'processing';
UPDATE orders SET status = 'out_for_delivery' WHERE status = 'shipped';

-- 2) Add the settings table used by the new Admin Settings page (store name,
--    support contact, delivery fee, free-delivery threshold).
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name VARCHAR(150) DEFAULT 'Health Pharmacy',
  support_phone VARCHAR(50),
  support_email VARCHAR(150),
  address VARCHAR(255),
  delivery_fee DECIMAL(10,2) DEFAULT 100,
  free_delivery_threshold DECIMAL(10,2) DEFAULT 2000,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO settings (id, store_name, support_phone, support_email, address, delivery_fee, free_delivery_threshold)
VALUES (1, 'Health Pharmacy', '+92 300 1234567', 'support@healthpharmacy.pk', 'Multan, Punjab, Pakistan', 100, 2000);
