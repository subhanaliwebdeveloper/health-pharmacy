import { request } from './api';

/**
 * Upload a prescription image directly to the backend Cloudinary endpoint.
 * Uses multipart/form-data — the backend handles Cloudinary upload.
 * @param {File} file
 * @param {string} note
 * @param {Function} onProgress - called with 0..100; approximated via XHR
 */
export const uploadPrescription = (file, note, onProgress = () => {}) => {
  const form = new FormData();
  form.append('prescription', file);
  form.append('note', note || '');

  // Use XHR to support upload progress reporting
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    xhr.open('POST', `${API}/prescriptions`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.message || 'Upload failed'));
      } catch {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(form);
  });
};

export const myPrescriptions = () => request('/prescriptions/mine');
