export function buildCloudinaryUploadUrl(cloudName) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
}

export function calculateUploadProgress(current, total) {
  if (!total || total <= 0 || current <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}

export async function uploadToCloudinary(file, { cloudName, uploadPreset, onProgress }) {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary config is missing. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your admin .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const xhr = new XMLHttpRequest();
  const result = await new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        onProgress(calculateUploadProgress(event.loaded, event.total));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Cloudinary response was invalid.'));
        }
      } else {
        let message = 'Upload failed';
        try {
          const response = JSON.parse(xhr.responseText);
          if (response?.error?.message) message = response.error.message;
        } catch (error) {
          // ignore invalid JSON
        }
        reject(new Error(message));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error while uploading image.')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')));

    xhr.open('POST', buildCloudinaryUploadUrl(cloudName), true);
    xhr.send(formData);
  });

  return result;
}
