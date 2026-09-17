import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUploadProgress, buildCloudinaryUploadUrl } from './cloudinary.js';

test('calculateUploadProgress returns percentage', () => {
  assert.equal(calculateUploadProgress(50, 100), 50);
  assert.equal(calculateUploadProgress(0, 0), 0);
  assert.equal(calculateUploadProgress(10, 0), 0);
});

test('buildCloudinaryUploadUrl uses cloud name', () => {
  assert.equal(buildCloudinaryUploadUrl('demo-cloud'), 'https://api.cloudinary.com/v1_1/demo-cloud/auto/upload');
});
