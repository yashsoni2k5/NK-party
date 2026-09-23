const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const hasCloudinaryKeys = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let storage;

if (hasCloudinaryKeys) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'nkparty_assets',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });
} else {
  console.warn("⚠️ Cloudinary environment variables missing. Falling back to memory storage.");
  storage = multer.memoryStorage();
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;

