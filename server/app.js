const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

// CORS configuration for Vercel deployment - fixed the origin URL
app.use(cors({
    origin: ['https://zidio-kanban-project.vercel.app', 'http://localhost:3000'], // Corrected origin without path
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204 // Some legacy browsers choke on 204
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://zidio-kanban-project.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(204).send();
    }
    next();
});

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Root endpoint to verify server is running
app.get('/', (req, res) => {
    res.json({ 
        message: 'Hello! Kanban API Server is running correctly.',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working correctly',
        timestamp: new Date().toISOString()
    });
});

// Main API routes
app.use('/api/v1', require('./src/v1/routes'));

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;
