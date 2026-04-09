/**
 * Cloudinary Service for Image Uploads
 * Handles image uploads to Cloudinary instead of local filesystem
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Check if Cloudinary is configured
 */
function isConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result with secure_url
 */
async function uploadImage(filePath, options = {}) {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_* environment variables.');
  }

  try {
    const {
      folder = 'ak-chauffage',
      transformation = {},
      tags = [],
      resourceType = 'image'
    } = options;

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      tags: ['ak-chauffage', ...tags],
      transformation: {
        quality: 'auto:good',
        fetch_format: 'auto',
        ...transformation
      },
      overwrite: false,
      unique_filename: true
    });

    // Delete local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
}

/**
 * Upload image from buffer
 * @param {Buffer} buffer - Image buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result
 */
async function uploadBuffer(buffer, options = {}) {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'ak-chauffage',
        resource_type: 'image',
        tags: ['ak-chauffage', ...(options.tags || [])],
        transformation: {
          quality: 'auto:good',
          fetch_format: 'auto',
          ...options.transformation
        }
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} - Deletion result
 */
async function deleteImage(publicId) {
  if (!isConfigured()) {
    return { result: 'not_found' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
}

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Image transformations
 * @returns {string} - Optimized image URL
 */
function getOptimizedUrl(publicId, transformations = {}) {
  if (!isConfigured()) {
    return publicId; // Return original if not configured
  }

  return cloudinary.url(publicId, {
    transformation: {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...transformations
    },
    secure: true
  });
}

/**
 * Generate thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} - Thumbnail URL
 */
function getThumbnailUrl(publicId, width = 300, height = 200) {
  return getOptimizedUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto'
  });
}

module.exports = {
  uploadImage,
  uploadBuffer,
  deleteImage,
  getOptimizedUrl,
  getThumbnailUrl,
  isConfigured
};
