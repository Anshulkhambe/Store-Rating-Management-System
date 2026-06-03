const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase, sequelize } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);

// Status route
app.get('/status', (req, res) => {
  res.json({ status: 'OK', message: 'Store Rating System Backend is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

async function startServer() {
  try {
    // Verify and/or create the database first
    await initDatabase();
    
    // Synchronize the tables
    await sequelize.sync({ force: false });
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the backend server:', error.message);
    process.exit(1);
  }
}

startServer();
