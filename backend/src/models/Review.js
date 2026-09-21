import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
