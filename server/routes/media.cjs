const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { upload, getCloudinaryUrl, deleteFromCloudinary } = require('../middleware/upload.cjs');
const authMiddleware = require('../middleware/auth.cjs');
const ERRORS = require('../utils/errors.cjs');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * GET /api/media
 * List all uploaded files
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 1. Get local files
    const files = await fs.readdir(UPLOADS_DIR);
    
    // Filter out .gitkeep and other system files
    const localMedia = files
      .filter(file => !file.startsWith('.'))
      .map(file => ({
        filename: file,
        url: `/uploads/${file}`,
        type: 'local',
        path: path.join(UPLOADS_DIR, file)
      }));

    // In a real app with Cloudinary, you'd also list files from Cloudinary API here
    // For now we just return local files + any hardcoded known assets
    
    res.json(localMedia);
  } catch (error) {
    console.error('Error listing media:', error);
    res.status(500).json({ error: ERRORS.MEDIA.LIST_FAILED });
  }
});

/**
 * POST /api/media/upload
 * Upload a file (local or Cloudinary)
 */
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: ERRORS.MEDIA.NO_FILE });
    }

    // If Cloudinary was used, we get the URL from the middleware
    const fileUrl = req.file.path.startsWith('http') 
      ? req.file.path 
      : `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: fileUrl,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: ERRORS.MEDIA.UPLOAD_FAILED });
  }
});

/**
 * DELETE /api/media/:identifier
 * Delete a media file
 */
router.delete('/:identifier', authMiddleware, async (req, res) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({ error: ERRORS.MEDIA.INVALID_ID });
    }

    // 1. Try deleting from Cloudinary if it looks like a Cloudinary ID
    if (identifier.includes('/')) {
      try {
        await deleteFromCloudinary(identifier);
      } catch (err) {
        console.warn('Cloudinary delete failed, might be local file:', err.message);
      }
    }

    // 2. Try deleting local file
    const filePath = path.join(UPLOADS_DIR, identifier);
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return res.json({ success: true, message: 'File deleted successfully' });
    } catch (err) {
      // If file doesn't exist locally and Cloudinary also failed/wasn't applicable
      if (identifier.includes('/')) {
        return res.json({ success: true, message: 'Cloudinary deletion attempted' });
      }
      return res.status(404).json({ error: ERRORS.MEDIA.NOT_FOUND });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: ERRORS.MEDIA.DELETE_FAILED });
  }
});

module.exports = router;
