const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const authMiddleware = require('../middleware/auth.cjs');
const upload = require('../middleware/upload.cjs');
const cloudinaryService = require('../utils/cloudinaryService.cjs');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Check if using Cloudinary
const USE_CLOUDINARY = cloudinaryService.isConfigured();

/**
 * GET /api/media
 * List all uploaded images (protected)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (USE_CLOUDINARY) {
      // For Cloudinary, return empty array (images are stored in content.json)
      // This route is mainly for local file listing
      return res.json([]);
    }

    const files = await fs.readdir(UPLOADS_DIR);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    const fileDetails = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          uploadedAt: stats.mtime,
        };
      })
    );

    res.json(fileDetails);
  } catch (error) {
    console.error('Error listing media:', error);
    res.status(500).json({ error: 'Failed to list media files' });
  }
});

/**
 * POST /api/media/upload
 * Upload image (protected)
 * Uses Cloudinary if configured, falls back to local storage
 */
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Use Cloudinary if configured
    if (USE_CLOUDINARY) {
      try {
        const result = await cloudinaryService.uploadImage(req.file.path, {
          folder: 'ak-chauffage/media',
          tags: ['media', req.body.tag || 'general']
        });

        console.log('✅ Image uploaded to Cloudinary:', result.url);

        return res.json({
          success: true,
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          size: result.bytes,
          storage: 'cloudinary'
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, falling back to local:', cloudinaryError);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      storage: 'local'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * DELETE /api/media/:identifier
 * Delete uploaded image (protected)
 * Supports both Cloudinary public IDs and local filenames
 */
router.delete('/:identifier', authMiddleware, async (req, res) => {
  try {
    const { identifier } = req.params;

    // Security: prevent path traversal for local files
    if (identifier.includes('..') || (identifier.includes('/') && !identifier.includes('ak-chauffage'))) {
      return res.status(400).json({ error: 'Invalid identifier' });
    }

    // Try Cloudinary first if it looks like a public ID
    if (USE_CLOUDINARY && identifier.includes('ak-chauffage/')) {
      try {
        await cloudinaryService.deleteImage(identifier);
        console.log('✅ Image deleted from Cloudinary:', identifier);
        return res.json({ success: true, message: 'File deleted from Cloudinary' });
      } catch (cloudinaryError) {
        console.error('Cloudinary delete failed:', cloudinaryError);
        // Fall through to try local
      }
    }

    // Try local storage
    const filePath = path.join(UPLOADS_DIR, identifier);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log('✅ Image deleted from local storage:', identifier);
      return res.json({ success: true, message: 'File deleted successfully' });
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
