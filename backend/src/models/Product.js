import mongoose from 'mongoose';

/** Sub-schema for a physical product batch (lot/expiry tracking). */
const productBatchSchema = new mongoose.Schema(
  {
    batch_number: { type: String, required: true, trim: true },
    mfg_date: { type: Date },
    expiry_date: { type: Date },
    stock_qty: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discount_price: { type: Number, min: 0, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    brand: { type: String, trim: true, maxlength: 120 },
    /** Cloudinary secure_url */
    image: { type: String, default: '' },
    /** Cloudinary public_id — retained for future deletion */
    image_public_id: { type: String, default: '' },
    /** Aggregate stock across all batches (maintained by pre-save hook). */
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true, maxlength: 80 },
    requires_prescription: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    sales_count: { type: Number, default: 0 },
    batches: [productBatchSchema],
  },
  { timestamps: true }
);

/** Keep top-level stock in sync with the sum of all batch quantities. */
productSchema.pre('save', function (next) {
  if (this.batches && this.batches.length > 0) {
    this.stock = this.batches.reduce((sum, b) => sum + (b.stock_qty || 0), 0);
  }
  next();
});

productSchema.index({ active: 1, category: 1 });
productSchema.index({ active: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sales_count: -1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);
