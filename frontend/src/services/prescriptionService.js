import { request } from './api';
import { uploadToCloudinary } from '../../../admin/src/services/cloudinary';

export const uploadPrescription = async (file, note, onProgress = () => {}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    const result = await uploadToCloudinary(file, { cloudName, uploadPreset, onProgress });
    const f = new FormData();
    f.append('prescription_url', result?.secure_url || result?.url || '');
    f.append('note', note || '');
    return request('/prescriptions', { method: 'POST', body: f });
  }

  const f = new FormData();
  f.append('prescription', file);
  f.append('note', note || '');
  return request('/prescriptions', { method: 'POST', body: f });
};

export const myPrescriptions = () => request('/prescriptions/mine');
