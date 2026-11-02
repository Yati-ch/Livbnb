const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Minimal multer storage engine that streams uploads to Cloudinary.
// Exposes `file.path` (image URL) and `file.filename` (public id) like
// multer-storage-cloudinary v4 did.
const storage = {
  _handleFile(req, file, cb) {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "Wanderlust_DEV",
        allowed_formats: ["png", "jpeg", "jpg"],
      },
      (err, result) => {
        if (err) return cb(err);
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      }
    );
    file.stream.pipe(upload);
  },
  _removeFile(req, file, cb) {
    cloudinary.uploader.destroy(file.filename, { invalidate: true }, cb);
  },
};

module.exports = {
  cloudinary,
  storage,
};
