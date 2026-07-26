const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, name, email, target_role, experience_level, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('[Get Profile Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, target_role, experience_level } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    await query(
      'UPDATE users SET name = ?, target_role = ?, experience_level = ? WHERE id = ?',
      [name.trim(), target_role || 'Fullstack Developer', experience_level || 'Mid Level', req.user.id]
    );

    const updatedUser = {
      id: req.user.id,
      name: name.trim(),
      email: req.user.email,
      target_role: target_role || 'Fullstack Developer',
      experience_level: experience_level || 'Mid Level'
    };

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Change Password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const users = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[Change Password Error]', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

module.exports = router;
