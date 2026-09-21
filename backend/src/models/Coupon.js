import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    expires_at: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ expires_at: 1, active: 1 });
couponSchema.index({ active: 1 });
couponSchema.index({ expires_at: 1 });

export default mongoose.model('Coupon', couponSchema);
