const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const router = require('./routers');
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'KDS Backend is running' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 KDS Backend server running on port ${port}`);
    console.log(`📊 Analysis endpoint: http://localhost:${port}/api/analiz`);
});

module.exports = app;
