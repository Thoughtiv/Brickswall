import express from 'express';
import { pool } from '../config/db.js';
import { adminAuth, editorAuth } from '../middleware/auth.js';

const router = express.Router();

// Record a generated quotation (Editor Auth)
router.post('/', editorAuth, async (req, res) => {
  const {
    quoteNumber,
    clientName,
    clientPhone,
    clientEmail,
    siteLocation,
    packageName,
    totalArea,
    quotedRate,
    grandTotal
  } = req.body || {};

  if (!quoteNumber || !String(quoteNumber).trim()) {
    return res.status(400).json({ error: 'Quotation number is required' });
  }

  if (!clientName || !String(clientName).trim()) {
    return res.status(400).json({ error: 'Client name is required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO editor_quotations 
        (quote_number, editor_user_id, editor_username, editor_name, client_name, client_phone, client_email, site_location, package_name, total_area, quoted_rate, grand_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(quoteNumber).trim(),
        req.editorUser.id,
        req.editorUser.username,
        req.editorUser.fullName,
        String(clientName).trim(),
        String(clientPhone || '').trim(),
        String(clientEmail || '').trim(),
        String(siteLocation || '').trim(),
        String(packageName || '').trim(),
        Number(totalArea) || 0,
        Number(quotedRate) || 0,
        Number(grandTotal) || 0
      ]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Quotation record saved successfully'
    });
  } catch (err) {
    console.error('Error saving editor quotation:', err);
    res.status(500).json({ error: 'Failed to save quotation log' });
  }
});

// List all generated quotations or filter by editor (Admin Auth)
router.get('/', adminAuth, async (req, res) => {
  const { editor_user_id } = req.query;

  try {
    let query = 'SELECT * FROM editor_quotations';
    const params = [];

    if (editor_user_id) {
      query += ' WHERE editor_user_id = ?';
      params.push(editor_user_id);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching editor quotations:', err);
    res.status(500).json({ error: 'Failed to retrieve editor quotations' });
  }
});

// Delete a quotation log entry (Admin Auth)
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM editor_quotations WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Quotation record not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting editor quotation:', err);
    res.status(500).json({ error: 'Failed to delete quotation log' });
  }
});

export default router;
