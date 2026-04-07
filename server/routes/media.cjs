const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const authMiddleware = require('../middleware/auth.cjs');
const upload = require('../middleware/upload.cjs');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * GET /api/media
 * List all uploaded images (protected)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
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
 */
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * DELETE /api/media/:filename
 * Delete uploaded image (protected)
 */
router.delete('/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(UPLOADS_DIR, filename);

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    await fs.unlink(filePath);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
