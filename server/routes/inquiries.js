import express from 'express';
import { pool } from '../config/db.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Post Inquiry (Public - Client submitting inquiry or estimate lead)
router.post('/', async (req, res) => {
  const {
    type,
    name,
    phone,
    serviceType,
    plotSize,
    floors,
    packageType,
    estimatedCost,
    location,
    message
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone fields are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO inquiries 
       (type, name, phone, serviceType, plotSize, floors, packageType, estimatedCost, location, message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type || 'contact',
        name,
        phone,
        serviceType || null,
        plotSize || null,
        floors || 1,
        packageType || null,
        estimatedCost || null,
        location || null,
        message || null
      ]
    );
    res.status(201).json({ success: true, inquiryId: result.insertId });
  } catch (err) {
    console.error('Error saving client inquiry:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// Get Inquiries (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error retrieving inquiries:', err);
    res.status(500).json({ error: 'Failed to retrieve client inquiries' });
  }
});

// Update Inquiry Status/Notes (Admin)
router.patch('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  try {
    let updateQuery = 'UPDATE inquiries SET ';
    const updateParams = [];

    if (status !== undefined) {
      updateQuery += 'status = ?, ';
      updateParams.push(status);
    }
    if (adminNotes !== undefined) {
      updateQuery += 'adminNotes = ?, ';
      updateParams.push(adminNotes);
    }

    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    if (updateParams.length === 1) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    const [result] = await pool.query(updateQuery, updateParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    res.json({ success: true, message: 'Inquiry updated successfully' });
  } catch (err) {
    console.error('Error updating inquiry:', err);
    res.status(500).json({ error: 'Failed to update inquiry record' });
  }
});

// Delete Inquiry (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM inquiries WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    console.error('Error deleting inquiry:', err);
    res.status(500).json({ error: 'Failed to delete inquiry record' });
  }
});

export default router;
