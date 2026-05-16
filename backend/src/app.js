const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { ensureUploadDir } = require('./utils/uploadPaths');

// Import routes
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const documentRoutes = require('./routes/documentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const shareRoutes = require('./routes/shareRoutes');

const app = express();

// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow serving static files/uploads cross-origin
}));

app.use(cors({
  origin: '*', // Allow all origins for seamless development and deployment
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply general API rate limiter to all /api routes except auth/login (which has its own limiter)
app.use('/api', apiLimiter);

// Serve static uploads folder
app.use('/uploads', express.static(ensureUploadDir()));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/vault/passwords', passwordRoutes);
app.use('/api/vault/documents', documentRoutes);
app.use('/api/vault/notes', noteRoutes);
app.use('/api/share', shareRoutes);

// Root endpoint check
app.get('/', (req, res) => {
  res.json({ message: 'Secure Personal Vault API is running successfully.' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
