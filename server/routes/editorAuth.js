import express from 'express';
import { pool } from '../config/db.js';
import { editorAuth } from '../middleware/auth.js';
import { verifyPassword, generateSessionToken } from '../utils/password.js';

const router = express.Router();

// Sessions stay valid for 7 days unless the admin revokes them sooner
const SESSION_DAYS = 7;

// Login (Public) - issues an opaque session token for the quotation editor
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password_hash, full_name, is_active FROM editor_users WHERE username = ?',
      [String(username).trim().toLowerCase()]
    );

    // Same message for unknown user and wrong password so usernames can't be probed
    if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Contact the administrator.' });
    }

    // Opportunistic cleanup of expired sessions
    await pool.query('DELETE FROM editor_sessions WHERE expiresAt < NOW()');

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO editor_sessions (token, user_id, expiresAt) VALUES (?, ?, ?)',
      [token, user.id, expiresAt]
    );
    await pool.query('UPDATE editor_users SET lastLoginAt = NOW() WHERE id = ?', [user.id]);

    res.json({
      token,
      expiresAt,
      user: { id: user.id, username: user.username, fullName: user.full_name }
    });
  } catch (err) {
    console.error('Error during editor login:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Current session (Editor)
router.get('/me', editorAuth, (req, res) => {
  res.json({ user: req.editorUser });
});

// Logout (Editor)
router.post('/logout', async (req, res) => {
  const token = req.headers['x-editor-token'];
  if (!token) return res.json({ success: true });

  try {
    await pool.query('DELETE FROM editor_sessions WHERE token = ?', [token]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error during editor logout:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
