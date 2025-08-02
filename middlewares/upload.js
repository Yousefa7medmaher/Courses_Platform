import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the upload directory exists or create it
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage settings for multer
const storage = multer.diskStorage({
  // Set destination folder for uploaded files
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  // Set unique filename using timestamp + original file extension
  filename: function (req, file, cb) {
    const uniquename = Date.now() + path.extname(file.originalname);
    cb(null, uniquename);
  }
});

// File filter to allow only images with specific extensions
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed")); // Reject file
  }
};

// Initialize multer with storage config, file filter, and file size limit (5MB)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;
