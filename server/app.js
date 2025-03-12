const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*', // Allow requests from localhost:3000
    credentials: true, // Allow cookies if needed
    methods: 'GET,POST,PUT,DELETE,OPTIONS', // Specify allowed HTTP methods
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', require('./src/v1/routes'));

module.exports = app;
