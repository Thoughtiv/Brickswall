import express from 'express';
import { pool } from '../config/db.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get Projects (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// Add Project (Admin)
router.post('/', adminAuth, async (req, res) => {
  const { title, category, categoryLabel, location, size, duration, image, description } = req.body;
  if (!title || !category || !categoryLabel || !location || !size || !duration || !image || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO projects (title, category, categoryLabel, location, size, duration, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, categoryLabel, location, size, duration, image, description]
    );
    res.status(201).json({ id: result.insertId, title, category, categoryLabel, location, size, duration, image, description });
  } catch (err) {
    console.error('Error adding project:', err);
    res.status(500).json({ error: 'Failed to add project' });
  }
});

// Update Project (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { title, category, categoryLabel, location, size, duration, image, description } = req.body;
  if (!title || !category || !categoryLabel || !location || !size || !duration || !image || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE projects 
       SET title = ?, category = ?, categoryLabel = ?, location = ?, size = ?, duration = ?, image = ?, description = ?
       WHERE id = ?`,
      [title, category, categoryLabel, location, size, duration, image, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ id, title, category, categoryLabel, location, size, duration, image, description });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete Project (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
