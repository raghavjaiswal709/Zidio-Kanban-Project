const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

// Database connection caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedDb;
  }
  
  try {
    console.log('Creating new database connection');
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout faster if DB is unreachable
    });
    
    cachedDb = mongoose.connection;
    console.log('MongoDB connected successfully');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

const app = express();

// CORS configuration for Vercel deployment
app.use(cors({
    origin: [
        'https://kanban-project-phi.vercel.app', 
        'https://zidio-kanban-project.vercel.app', 
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204 // Some legacy browsers choke on 204
}));

// Debug middleware to log requests with timing
app.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Request started`);
    
    // Add response finish listener to log timing
    res.on('finish', () => {
        const duration = Date.now() - req.requestTime;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Response completed in ${duration}ms with status ${res.statusCode}`);
    });
    
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection middleware
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error('Failed to connect to database:', error);
        return res.status(500).json({ 
            error: 'Database Connection Error',
            message: 'Unable to connect to database',
            timestamp: new Date().toISOString()
        });
    }
});

// Root endpoint to verify server is running
app.get('/', (req, res) => {
    res.json({ 
        message: 'Hello! Kanban API Server is running correctly.',
        status: 'online',
        timestamp: new Date().toISOString(),
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working correctly',
        timestamp: new Date().toISOString(),
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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

// Global error handler with improved error formatting
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    
    // Check for specific error types
    const statusCode = err.statusCode || 500;
    const errorMessage = process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'An unexpected error occurred';
        
    res.status(statusCode).json({
        error: err.name || 'Internal Server Error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: req.requestTime // Helpful for tracking issues in logs
    });
});

// Serverless-friendly exports
module.exports = app;
