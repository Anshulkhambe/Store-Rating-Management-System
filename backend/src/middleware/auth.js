const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_store_rating_key_12345';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
}

function requireStoreOwner(req, res, next) {
  if (req.user && req.user.role === 'store_owner') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Store Owner privileges required.' });
  }
}

function requireNormalUser(req, res, next) {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Normal User privileges required.' });
  }
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStoreOwner,
  requireNormalUser,
};
