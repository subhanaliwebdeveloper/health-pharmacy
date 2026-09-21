import Settings from '../models/Settings.js';
import asyncHandler from '../utils/asyncHandler.js';

export const get = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings);
});

export const update = asyncHandler(async (req, res) => {
  const { store_name, support_phone, support_email, address, delivery_fee, free_delivery_threshold } =
    req.body;
  const settings = await Settings.updateSingleton({
    store_name,
    support_phone,
    support_email,
    address,
    delivery_fee,
    free_delivery_threshold,
  });
  res.json(settings);
});
