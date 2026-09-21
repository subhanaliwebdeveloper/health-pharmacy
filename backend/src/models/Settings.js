import mongoose from 'mongoose';

/**
 * Singleton settings document — always upserted with _id = 'global'.
 * Use Settings.getSingleton() to read, Settings.updateSingleton(data) to write.
 */
const settingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'global' },
    store_name: { type: String, default: 'Health Pharmacy', maxlength: 150 },
    support_phone: { type: String, default: '' },
    support_email: { type: String, default: '' },
    address: { type: String, default: '' },
    delivery_fee: { type: Number, default: 0 },
    free_delivery_threshold: { type: Number, default: 0 },
  },
  { timestamps: true, _id: false }
);

settingsSchema.statics.getSingleton = async function () {
  const doc = await this.findOneAndUpdate(
    { _id: 'global' },
    { $setOnInsert: { _id: 'global', delivery_fee: 0, free_delivery_threshold: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (doc && doc.delivery_fee !== 0) {
    doc.delivery_fee = 0;
    doc.free_delivery_threshold = 0;
    await doc.save();
  }
  return doc;
};

settingsSchema.statics.updateSingleton = function (data) {
  return this.findOneAndUpdate({ _id: 'global' }, { $set: data }, { upsert: true, new: true });
};

export default mongoose.model('Settings', settingsSchema);
