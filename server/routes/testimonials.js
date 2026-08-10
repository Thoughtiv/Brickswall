import express from 'express';
import { pool } from '../config/db.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get Testimonials (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ error: 'Failed to retrieve testimonials' });
  }
});

// Add Testimonial (Admin)
router.post('/', adminAuth, async (req, res) => {
  const { name, location, role, quote, avatar, rating } = req.body;
  if (!name || !location || !role || !quote || !avatar) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO testimonials (name, location, role, quote, avatar, rating)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, location, role, quote, avatar, rating !== undefined ? Number(rating) : 5]
    );
    res.status(201).json({ id: result.insertId, name, location, role, quote, avatar, rating });
  } catch (err) {
    console.error('Error adding testimonial:', err);
    res.status(500).json({ error: 'Failed to add testimonial' });
  }
});

// Update Testimonial (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, location, role, quote, avatar, rating } = req.body;
  if (!name || !location || !role || !quote || !avatar) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE testimonials 
       SET name = ?, location = ?, role = ?, quote = ?, avatar = ?, rating = ?
       WHERE id = ?`,
      [name, location, role, quote, avatar, rating !== undefined ? Number(rating) : 5, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ id, name, location, role, quote, avatar, rating });
  } catch (err) {
    console.error('Error updating testimonial:', err);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Delete Testimonial (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;
