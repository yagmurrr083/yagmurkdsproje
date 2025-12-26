const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middlewares (teacher skeleton pattern)
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger); // Request logging

// Routes
const router = require('./routers');
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'KDS Backend is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
    console.log(`🚀 KDS Backend server running on port ${port}`);
    console.log(`📊 Analysis endpoint: http://localhost:${port}/api/analiz`);
});

module.exports = app;
