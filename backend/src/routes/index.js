/**
 * Route Index
 * Aggregates all API routes
 */
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const listingRoutes = require('./listingRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
const notificationRoutes = require('./notificationRoutes');
const messageRoutes = require('./messageRoutes');
const purchaseRoutes = require('./purchaseRoutes');
const conversationRoutes = require('./conversationRoutes');
const uploadRoutes = require('./uploadRoutes');
const siteSettingsRoutes = require('./siteSettingsRoutes');

// API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/conversations', conversationRoutes);
router.use('/upload', uploadRoutes);
router.use('/settings', siteSettingsRoutes);

module.exports = router;

