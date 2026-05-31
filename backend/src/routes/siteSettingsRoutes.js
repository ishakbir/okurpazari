/**
 * Site Settings Routes
 * Public: GET settings
 * Admin: PUT settings + image upload
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticate } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/roleGuard');
const { SiteSettings } = require('../models');
const { setUploadType, handleUploadError } = require('../middleware/upload');
const multer = require('multer');
const crypto = require('crypto');

// Slider image upload config
const sliderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/slider'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `slider-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

const sliderUpload = multer({
  storage: sliderStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece JPEG, PNG, WebP ve GIF formatları kabul edilir'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB for slider images
});

/**
 * GET /api/settings/public
 * Get all public settings (slider, site name, etc.)
 */
router.get('/public', async (req, res) => {
  try {
    const sliderItems = await SiteSettings.getSetting('slider_items', []);
    const siteName = await SiteSettings.getSetting('site_name', 'Okur Pazarı');
    const headerCategories = await SiteSettings.getSetting('header_categories', []);

    res.json({
      success: true,
      data: {
        siteName,
        sliderItems,
        headerCategories
      }
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ success: false, message: 'Ayarlar yüklenemedi' });
  }
});

/**
 * GET /api/settings/admin
 * Get all settings (admin only)
 */
router.get('/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const settings = await SiteSettings.findAll();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    res.json({
      success: true,
      data: { settings: settingsMap }
    });
  } catch (error) {
    console.error('Admin settings fetch error:', error);
    res.status(500).json({ success: false, message: 'Ayarlar yüklenemedi' });
  }
});

/**
 * POST /api/settings/slider/upload
 * Upload a slider image (admin only)
 */
router.post('/slider/upload', authenticate, requireAdmin, sliderUpload.single('image'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resim yüklenmedi' });
    }

    const imageUrl = `/uploads/slider/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Slider resmi yüklendi',
      data: { imageUrl }
    });
  } catch (error) {
    console.error('Slider upload error:', error);
    res.status(500).json({ success: false, message: 'Resim yüklenemedi' });
  }
});

/**
 * PUT /api/settings/slider
 * Update slider items (admin only)
 */
router.put('/slider', authenticate, requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Slider öğeleri geçersiz' });
    }

    // Validate each item (only imageUrl is required; title is optional)
    for (const item of items) {
      if (!item.imageUrl) {
        return res.status(400).json({ 
          success: false, 
          message: 'Her slider öğesi için resim zorunludur' 
        });
      }
    }

    await SiteSettings.setSetting('slider_items', items, 'Ana sayfa slider öğeleri');

    res.json({
      success: true,
      message: 'Slider ayarları güncellendi',
      data: { items }
    });
  } catch (error) {
    console.error('Slider update error:', error);
    res.status(500).json({ success: false, message: 'Slider güncellenemedi' });
  }
});

/**
 * PUT /api/settings/site-name
 * Update site name (admin only)
 */
router.put('/site-name', authenticate, requireAdmin, async (req, res) => {
  try {
    const { siteName } = req.body;

    if (!siteName || typeof siteName !== 'string') {
      return res.status(400).json({ success: false, message: 'Site adı geçersiz' });
    }

    await SiteSettings.setSetting('site_name', siteName, 'Site adı');

    res.json({
      success: true,
      message: 'Site adı güncellendi',
      data: { siteName }
    });
  } catch (error) {
    console.error('Site name update error:', error);
    res.status(500).json({ success: false, message: 'Site adı güncellenemedi' });
  }
});

/**
 * GET /api/settings/categories
 * Get category tree (public)
 */
const { CATEGORIES } = require('../config/constants');

router.get('/categories', async (req, res) => {
  try {
    const defaultCategories = CATEGORIES.map(name => ({ name, subcategories: [] }));
    const categories = await SiteSettings.getSetting('categories', defaultCategories);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ success: false, message: 'Kategoriler yüklenemedi' });
  }
});

/**
 * PUT /api/settings/categories
 * Update category tree (admin only)
 */
router.put('/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ success: false, message: 'Kategoriler geçersiz format' });
    }

    // Validate each category
    for (const cat of categories) {
      if (!cat.name || typeof cat.name !== 'string') {
        return res.status(400).json({ success: false, message: 'Her kategori için isim zorunludur' });
      }
      if (cat.subcategories && !Array.isArray(cat.subcategories)) {
        return res.status(400).json({ success: false, message: 'Alt kategoriler dizi olmalıdır' });
      }
    }

    await SiteSettings.setSetting('categories', categories, 'Kategori ağacı');

    res.json({
      success: true,
      message: 'Kategoriler güncellendi',
      data: { categories }
    });
  } catch (error) {
    console.error('Categories update error:', error);
    res.status(500).json({ success: false, message: 'Kategoriler güncellenemedi' });
  }
});

/**
 * GET /api/settings/header-categories
 * Get list of category names shown in header (public - already in /public endpoint too)
 */
router.get('/header-categories', async (req, res) => {
  try {
    const headerCategories = await SiteSettings.getSetting('header_categories', []);
    res.json({ success: true, data: { headerCategories } });
  } catch (error) {
    console.error('Header categories fetch error:', error);
    res.status(500).json({ success: false, message: 'Header kategorileri yüklenemedi' });
  }
});

/**
 * PUT /api/settings/header-categories
 * Update header category list (admin only)
 * Expects: { headerCategories: ["Hukuk", "Edebiyat", ...] }
 */
router.put('/header-categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const { headerCategories } = req.body;
    if (!Array.isArray(headerCategories)) {
      return res.status(400).json({ success: false, message: 'Geçersiz format' });
    }
    await SiteSettings.setSetting('header_categories', headerCategories, 'Header\'da gösterilecek kategoriler');
    res.json({ success: true, message: 'Header kategorileri güncellendi', data: { headerCategories } });
  } catch (error) {
    console.error('Header categories update error:', error);
    res.status(500).json({ success: false, message: 'Header kategorileri güncellenemedi' });
  }
});

module.exports = router;

