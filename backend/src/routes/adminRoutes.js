const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUserFields } = require('../middleware/validation');

// All admin routes require token authentication and admin role check
router.use(authenticateToken, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.post('/users', validateUserFields, adminController.createUser);
router.get('/users', adminController.getUsers);
router.get('/stores', adminController.getStores);
router.get('/users/:id', adminController.getUserDetails);

module.exports = router;
