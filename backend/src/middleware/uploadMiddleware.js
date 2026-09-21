import multer from 'multer';
import { uploadBuffer } from '../config/cloudinary.js';

/** Accept only common image MIME types. */
const imageFilter = (req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

/** Keep files in memory — buffers are piped directly to Cloudinary. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFilter,
});

/**
 * Upload req.file buffer to Cloudinary and attach result to req.cloudinary.
 * Optionally pass a `folder` string for organisation.
 * @param {string} folder - Cloudinary folder name
 */
export function uploadToCloudinary(folder = 'pharmacy') {
  return async (req, res, next) => {
    if (!req.file) return next();
    try {
      req.cloudinary = await uploadBuffer(req.file.buffer, {
        folder,
        resource_type: 'image',
      });
      next();
    } catch (err) {
      next(err);
    }
  };
}
