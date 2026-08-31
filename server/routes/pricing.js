import express from 'express';
import { pool } from '../config/db.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// An earlier version of the update route stringified section objects, leaving
// rows that hold the literal "[object Object]". Drop those remnants on read so
// they never reach the admin panel or the packages page.
const isCorruptedEntry = (entry) => typeof entry === 'string' && entry.trim() === '[object Object]';

const sanitizeServices = (services) => {
  if (!Array.isArray(services)) return [];
  return services
    .filter(entry => !isCorruptedEntry(entry))
    .map(entry => {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        return {
          ...entry,
          points: (Array.isArray(entry.points) ? entry.points : []).filter(point => !isCorruptedEntry(point))
        };
      }
      return entry;
    });
};

// Get Pricing (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pricing');
    const pricingMap = {};
    rows.forEach(row => {
      let services = [];
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
        warranty: row.warranty || '',
        servicesHeading: row.servicesHeading || 'Included Services & Warranty',
        services: sanitizeServices(services)
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
      // Only columns actually present in the payload are written. The admin panel
      // falls back to a stub package object when it cannot read live pricing, and
      // blindly coercing every missing field to '' wiped saved copy in production.
      const updates = {};

      if (pkg.name !== undefined) updates.name = pkg.name || id;
      if (pkg.badge !== undefined) updates.badge = pkg.badge || '';
      if (pkg.desc !== undefined) updates['`desc`'] = pkg.desc || '';
      if (pkg.warranty !== undefined) updates.warranty = pkg.warranty || '';
      if (pkg.servicesHeading !== undefined) {
        updates.servicesHeading = pkg.servicesHeading || 'Included Services & Warranty';
      }

      if (pkg.priceNum !== undefined) {
        const priceNum = Number(pkg.priceNum) || 0;
        updates.priceNum = priceNum;
        updates.pricePerSqFt = `₹${priceNum.toLocaleString('en-IN')} / sq.ft`;
      }

      if (pkg.services !== undefined) {
        const list = Array.isArray(pkg.services)
          ? pkg.services
          : String(pkg.services).split('\n');

        // The admin panel sends either the legacy flat list of strings or the
        // newer { heading, points } sections. Coercing every entry with String()
        // turned each section into the literal "[object Object]", so the two
        // shapes are normalised separately.
        const sections = list.map(entry => {
          if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
            return {
              heading: String(entry.heading ?? '').trim(),
              points: (Array.isArray(entry.points) ? entry.points : [])
                .map(point => String(point ?? '').trim())
                .filter(Boolean)
            };
          }
          return String(entry ?? '').trim();
        }).filter(entry => (
          typeof entry === 'string'
            ? Boolean(entry)
            : Boolean(entry.heading) || entry.points.length > 0
        ));

        updates.services = JSON.stringify(sections);
      }

      const columns = Object.keys(updates);
      if (columns.length === 0) continue;

      const [result] = await pool.query(
        `UPDATE pricing SET ${columns.map(c => `${c} = ?`).join(', ')} WHERE id = ?`,
        [...columns.map(c => updates[c]), id]
      );

      // A plain UPDATE reports success while changing nothing when the tier row is
      // missing, so insert it instead of silently dropping the admin's edit.
      if (result.affectedRows === 0) {
        const priceNum = Number(pkg.priceNum) || 0;
        await pool.query(
          'INSERT INTO pricing (id, name, priceNum, pricePerSqFt, badge, `desc`, warranty, servicesHeading, services) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            pkg.name || id,
            priceNum,
            `₹${priceNum.toLocaleString('en-IN')} / sq.ft`,
            pkg.badge || '',
            pkg.desc || '',
            pkg.warranty || '',
            pkg.servicesHeading || 'Included Services & Warranty',
            updates.services || '[]'
          ]
        );
      }
    }
    res.json({ success: true, message: 'Pricing configurations updated successfully' });
  } catch (err) {
    console.error('Error updating pricing:', err);
    res.status(500).json({ error: `Failed to update pricing database: ${err.message}` });
  }
});

// GET Package Comparison Matrix (Public)
router.get('/matrix', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', ['package_matrix']);
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
      'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      ['package_matrix', matrixJson, matrixJson]
    );
    res.json({ success: true, message: 'Package comparison matrix updated successfully', matrix });
  } catch (err) {
    console.error('Error updating matrix:', err);
    res.status(500).json({ error: 'Failed to update package comparison matrix' });
  }
});

export default router;
