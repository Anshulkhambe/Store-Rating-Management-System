const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, requireNormalUser, requireStoreOwner } = require('../middleware/auth');

// Normal user endpoints
router.get('/list', authenticateToken, requireNormalUser, storeController.getStoresForUser);
router.post('/rate', authenticateToken, requireNormalUser, storeController.submitRating);

// Store owner endpoint
router.get('/dashboard', authenticateToken, requireStoreOwner, storeController.getStoreDashboard);

module.exports = router;
