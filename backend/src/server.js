const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const interviewRoutes = require('./routes/interview.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', service: 'AI Mock Interview API', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Express Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Initialize Database & Start Server
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`[Server] AI Mock Interview API server running on http://localhost:${PORT}`);
  });
}

startServer();
