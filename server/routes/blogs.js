import express from 'express';
import { pool } from '../config/db.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/blogs (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// GET /api/blogs/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// POST /api/blogs (Admin)
router.post('/', adminAuth, async (req, res) => {
  const { title, category, date, readTime, image, excerpt, content, author } = req.body;
  if (!title || !excerpt || !content) {
    return res.status(400).json({ error: 'Title, excerpt, and content are required' });
  }

  try {
    const postDate = date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const postReadTime = readTime || '5 min read';
    const postCategory = category || 'Construction Tips';
    const postAuthor = author || 'Bricks Wall Editorial';
    const postImage = image || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80';

    const [result] = await pool.query(
      'INSERT INTO blogs (title, category, date, readTime, image, excerpt, content, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, postCategory, postDate, postReadTime, postImage, excerpt, content, postAuthor]
    );

    const [newBlog] = await pool.query('SELECT * FROM blogs WHERE id = ?', [result.insertId]);
    res.status(201).json(newBlog[0]);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT /api/blogs/:id (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  const { title, category, date, readTime, image, excerpt, content, author } = req.body;
  try {
    await pool.query(
      'UPDATE blogs SET title = ?, category = ?, date = ?, readTime = ?, image = ?, excerpt = ?, content = ?, author = ? WHERE id = ?',
      [title, category, date, readTime, image, excerpt, content, author, req.params.id]
    );

    const [updatedBlog] = await pool.query('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
    res.json(updatedBlog[0]);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE /api/blogs/:id (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;
