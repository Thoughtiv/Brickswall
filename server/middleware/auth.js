import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

export const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === expectedPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }
};

/**
 * Validates an editor session token issued by /api/editor-auth/login.
 * Rejects unknown, expired, and deactivated-user tokens, and attaches
 * the resolved user to req.editorUser for downstream handlers.
 */
export const editorAuth = async (req, res, next) => {
  const token = req.headers['x-editor-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Login required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT s.token, s.expiresAt, u.id, u.username, u.full_name, u.is_active
       FROM editor_sessions s
       JOIN editor_users u ON u.id = s.user_id
       WHERE s.token = ?`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const session = rows[0];

    if (new Date(session.expiresAt) < new Date()) {
      await pool.query('DELETE FROM editor_sessions WHERE token = ?', [token]);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    if (!session.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }

    req.editorUser = {
      id: session.id,
      username: session.username,
      fullName: session.full_name
    };
    next();
  } catch (err) {
    console.error('Error validating editor session:', err);
    res.status(500).json({ error: 'Failed to validate session' });
  }
};
