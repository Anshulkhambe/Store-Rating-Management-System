const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateUserFields, validatePasswordChange } = require('../middleware/validation');

router.post('/register', validateUserFields, authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.put('/password', authenticateToken, validatePasswordChange, authController.updatePassword);

module.exports = router;
