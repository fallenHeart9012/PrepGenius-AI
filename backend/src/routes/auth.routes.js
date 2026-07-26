const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const authenticateToken = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_mock_interview_2026';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, target_role, experience_level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check existing user
    const existingUsers = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await query(
      'INSERT INTO users (name, email, password_hash, target_role, experience_level) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, target_role || 'Fullstack Developer', experience_level || 'Mid Level']
    );

    const userId = result.insertId;

    // Issue JWT token
    const token = jwt.sign(
      { id: userId, name: name.trim(), email: email.toLowerCase().trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        target_role: target_role || 'Fullstack Developer',
        experience_level: experience_level || 'Mid Level'
      }
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        target_role: user.target_role,
        experience_level: user.experience_level
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, target_role, experience_level, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('[Me Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

module.exports = router;
