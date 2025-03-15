const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

// Improved CORS configuration for Vercel deployment
app.use(cors({
    origin: ['https://zidio-kanban-project.vercel.app/login', 'http://localhost:3000'], // Allow specific origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add OPTIONS preflight handling for all routes
app.options('*', cors());

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working correctly' });
});

app.use('/api/v1', require('./src/v1/routes'));

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        path: req.originalUrl 
    });
});

module.exports = app;
