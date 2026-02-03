const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Environment variables
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// User Service routes
app.post('/api/users/register', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/users/register`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal server error'
    });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/users/login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal server error'
    });
  }
});

app.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal server error'
    });
  }
});

// Order Service routes
app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal server error'
    });
  }
});

app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal server error'
    });
  }
});

app.get('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

module.exports = app;
