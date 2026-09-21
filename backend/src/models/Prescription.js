import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    /** Cloudinary secure_url */
    image_url: { type: String, required: true },
    /** Cloudinary public_id — retained for future deletion/access control */
    image_public_id: { type: String, required: true },
    note: { type: String, trim: true, default: '' },
    admin_note: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ user: 1, status: 1 });
prescriptionSchema.index({ user: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ createdAt: -1 });

export default mongoose.model('Prescription', prescriptionSchema);
