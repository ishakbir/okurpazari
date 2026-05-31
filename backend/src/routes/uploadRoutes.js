/**
 * Upload Routes
 * Handles file uploads for profiles and listings
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticate } = require('../middlewares/auth');
const { profileUpload, listingUpload, setUploadType, handleUploadError } = require('../middleware/upload');
const { User } = require('../models');

/**
 * POST /api/upload/profile
 * Upload profile photo
 */
router.post('/profile',
  authenticate,
  setUploadType('profiles'),
  profileUpload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Dosya yüklenmedi'
        });
      }

      // Get file URL
      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      // Update user profile
      await User.update(
        { profile_image: imageUrl },
        { where: { id: req.user.id } }
      );

      res.json({
        success: true,
        message: 'Profil fotoğrafı güncellendi',
        data: {
          imageUrl
        }
      });
    } catch (error) {
      console.error('Profile upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Dosya yüklenirken bir hata oluştu'
      });
    }
  }
);

/**
 * POST /api/upload/listing
 * Upload listing photos (up to 8)
 */
router.post('/listing',
  authenticate,
  setUploadType('listings'),
  listingUpload.array('images', 8),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Dosya yüklenmedi'
        });
      }

      // Get file URLs
      const imageUrls = req.files.map(file => `/uploads/listings/${file.filename}`);

      res.json({
        success: true,
        message: `${imageUrls.length} fotoğraf yüklendi`,
        data: {
          imageUrls
        }
      });
    } catch (error) {
      console.error('Listing upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Dosyalar yüklenirken bir hata oluştu'
      });
    }
  }
);

module.exports = router;
