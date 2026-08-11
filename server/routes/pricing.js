import express from 'express';
import { pool } from '../config/db.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get Pricing (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pricing');
    const pricingMap = {};
    rows.forEach(row => {
      pricingMap[row.id] = {
        id: row.id,
        name: row.name,
        priceNum: row.priceNum,
        pricePerSqFt: row.pricePerSqFt,
        badge: row.badge,
        desc: row.desc
      };
    });
    res.json(pricingMap);
  } catch (err) {
    console.error('Error fetching pricing:', err);
    res.status(500).json({ error: 'Failed to retrieve pricing data' });
  }
});

// Update Pricing (Admin)
router.put('/', adminAuth, async (req, res) => {
  const { packages } = req.body;
  
  if (!packages || typeof packages !== 'object') {
    return res.status(400).json({ error: 'Invalid payload: packages object is required' });
  }

  try {
    for (const [id, pkg] of Object.entries(packages)) {
      const pricePerSqFt = `₹${pkg.priceNum.toLocaleString('en-IN')} / sq.ft`;
      await pool.query(
        'UPDATE pricing SET name = ?, priceNum = ?, pricePerSqFt = ?, badge = ?, \`desc\` = ? WHERE id = ?',
        [pkg.name, pkg.priceNum, pricePerSqFt, pkg.badge, pkg.desc, id]
      );
    }
    res.json({ success: true, message: 'Pricing configurations updated successfully' });
  } catch (err) {
    console.error('Error updating pricing:', err);
    res.status(500).json({ error: 'Failed to update pricing database' });
  }
});

// GET Package Comparison Matrix (Public)
router.get('/matrix', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = "package_matrix"');
    if (rows.length > 0 && rows[0].value) {
      return res.json(JSON.parse(rows[0].value));
    }
    res.json([]);
  } catch (err) {
    console.error('Error fetching matrix:', err);
    res.status(500).json({ error: 'Failed to retrieve package comparison matrix' });
  }
});

// Update Package Comparison Matrix (Admin)
router.put('/matrix', adminAuth, async (req, res) => {
  const { matrix } = req.body;
  if (!Array.isArray(matrix)) {
    return res.status(400).json({ error: 'Invalid payload: matrix array is required' });
  }
  try {
    const matrixJson = JSON.stringify(matrix);
    await pool.query(
      'INSERT INTO settings (key_name, value) VALUES ("package_matrix", ?) ON DUPLICATE KEY UPDATE value = ?',
      [matrixJson, matrixJson]
    );
    res.json({ success: true, message: 'Package comparison matrix updated successfully', matrix });
  } catch (err) {
    console.error('Error updating matrix:', err);
    res.status(500).json({ error: 'Failed to update package comparison matrix' });
  }
});

export default router;
