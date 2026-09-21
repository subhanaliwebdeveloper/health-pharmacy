import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 190,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 30 },
    address: { type: String, trim: true, maxlength: 255 },
    city: { type: String, trim: true, maxlength: 100 },
    role: {
      type: String,
      enum: ['customer', 'admin', 'pharmacist_reviewer', 'super_admin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

/** Hash password before saving if it was modified. */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/** Compare a plain-text password against the stored hash. */
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
