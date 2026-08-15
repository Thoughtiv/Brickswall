import express from 'express';
import { pool } from '../config/db.js';
import { adminAuth } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';

const router = express.Router();

const USERNAME_PATTERN = /^[a-z0-9._-]{3,50}$/;
const MIN_PASSWORD_LENGTH = 6;

function validateUsername(username) {
  if (!username) return 'Username is required';
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username must be 3-50 characters using only letters, numbers, dot, underscore or hyphen';
  }
  return null;
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

// List editor users (Admin) - password hashes are never returned
router.get('/', adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.is_active, u.createdAt, u.lastLoginAt,
              (SELECT COUNT(*) FROM editor_sessions s
               WHERE s.user_id = u.id AND s.expiresAt > NOW()) AS activeSessions
       FROM editor_users u
       ORDER BY u.createdAt DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching editor users:', err);
    res.status(500).json({ error: 'Failed to retrieve editor users' });
  }
});

// Create an editor user (Admin)
router.post('/', adminAuth, async (req, res) => {
  const { username, password, fullName } = req.body || {};
  const normalizedUsername = String(username || '').trim().toLowerCase();

  const usernameError = validateUsername(normalizedUsername);
  if (usernameError) return res.status(400).json({ error: usernameError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM editor_users WHERE username = ?', [normalizedUsername]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'That username is already taken' });
    }

    const [result] = await pool.query(
      'INSERT INTO editor_users (username, password_hash, full_name) VALUES (?, ?, ?)',
      [normalizedUsername, hashPassword(String(password)), String(fullName).trim()]
    );

    res.status(201).json({
      success: true,
      user: {
        id: result.insertId,
        username: normalizedUsername,
        full_name: String(fullName).trim(),
        is_active: 1
      }
    });
  } catch (err) {
    console.error('Error creating editor user:', err);
    res.status(500).json({ error: 'Failed to create editor user' });
  }
});

// Update an editor user - rename, activate/deactivate, or reset password (Admin)
router.patch('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { fullName, isActive, password } = req.body || {};

  const updates = [];
  const values = [];

  if (fullName !== undefined) {
    if (!String(fullName).trim()) {
      return res.status(400).json({ error: 'Full name cannot be empty' });
    }
    updates.push('full_name = ?');
    values.push(String(fullName).trim());
  }

  if (isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(isActive ? 1 : 0);
  }

  if (password !== undefined) {
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });
    updates.push('password_hash = ?');
    values.push(hashPassword(String(password)));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No changes supplied' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE editor_users SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Editor user not found' });
    }

    // A password reset or a deactivation must kick existing logins out immediately
    if (password !== undefined || isActive === false || isActive === 0) {
      await pool.query('DELETE FROM editor_sessions WHERE user_id = ?', [id]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating editor user:', err);
    res.status(500).json({ error: 'Failed to update editor user' });
  }
});

// Delete an editor user and revoke their sessions (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM editor_sessions WHERE user_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM editor_users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Editor user not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting editor user:', err);
    res.status(500).json({ error: 'Failed to delete editor user' });
  }
});

export default router;
