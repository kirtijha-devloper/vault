const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { ensureUploadDir } = require('../utils/uploadPaths');
require('dotenv').config();

// Check if Cloudinary is configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let storage;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'secure_vault_docs',
      resource_type: 'auto', // supports images, pdfs, raw files
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx', 'txt', 'zip']
    }
  });
} else {
  // Fallback to local disk storage
  const uploadDir = ensureUploadDir();

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
}

// File filter and size limit
const fileFilter = (req, file, cb) => {
  // Validate extension and MIME separately so common office/text types pass reliably.
  const allowedExts = /\.(jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|xls|xlsx)$/i;
  const allowedMimes = /^(image\/(jpeg|jpg|png|gif)|application\/pdf|text\/plain|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/zip|application\/x-zip-compressed|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/i;
  const extname = allowedExts.test(path.extname(file.originalname));
  const mimetype = allowedMimes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Error: File upload only supports images, PDFs, and standard office documents.'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
