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
      let materials = [];
      let services = [];
      if (row.materials) {
        try {
          materials = typeof row.materials === 'string' && row.materials.trim().startsWith('[')
            ? JSON.parse(row.materials)
            : row.materials.split('\n').map(s => s.trim()).filter(Boolean);
        } catch (e) {
          materials = row.materials.split('\n').map(s => s.trim()).filter(Boolean);
        }
      }
      if (row.services) {
        try {
          services = typeof row.services === 'string' && row.services.trim().startsWith('[')
            ? JSON.parse(row.services)
            : row.services.split('\n').map(s => s.trim()).filter(Boolean);
        } catch (e) {
          services = row.services.split('\n').map(s => s.trim()).filter(Boolean);
        }
      }

      pricingMap[row.id] = {
        id: row.id,
        name: row.name,
        priceNum: row.priceNum,
        pricePerSqFt: row.pricePerSqFt,
        badge: row.badge,
        desc: row.desc,
        materialHeading: row.materialHeading || 'Material Specs',
        materials: materials,
        warranty: row.warranty || '',
        servicesHeading: row.servicesHeading || 'Included Services & Warranty',
        services: services
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
      const priceNum = Number(pkg.priceNum) || 0;
      const pricePerSqFt = `₹${priceNum.toLocaleString('en-IN')} / sq.ft`;
      
      let materialsStr = '';
      if (Array.isArray(pkg.materials)) {
        materialsStr = JSON.stringify(pkg.materials.map(s => String(s).trim()).filter(Boolean));
      } else if (typeof pkg.materials === 'string') {
        materialsStr = JSON.stringify(pkg.materials.split('\n').map(s => s.trim()).filter(Boolean));
      }

      let servicesStr = '';
      if (Array.isArray(pkg.services)) {
        servicesStr = JSON.stringify(pkg.services.map(s => String(s).trim()).filter(Boolean));
      } else if (typeof pkg.services === 'string') {
        servicesStr = JSON.stringify(pkg.services.split('\n').map(s => s.trim()).filter(Boolean));
      }

      const materialHeading = pkg.materialHeading || 'Material Specs';
      const servicesHeading = pkg.servicesHeading || 'Included Services & Warranty';

      await pool.query(
        'UPDATE pricing SET name = ?, priceNum = ?, pricePerSqFt = ?, badge = ?, `desc` = ?, materialHeading = ?, materials = ?, warranty = ?, servicesHeading = ?, services = ? WHERE id = ?',
        [pkg.name || id, priceNum, pricePerSqFt, pkg.badge || '', pkg.desc || '', materialHeading, materialsStr, pkg.warranty || '', servicesHeading, servicesStr, id]
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
