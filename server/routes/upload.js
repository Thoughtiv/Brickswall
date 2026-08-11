import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

// POST /api/upload
router.post('/', async (req, res) => {
  try {
    const { imageBase64, name } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 string is required' });
    }

    // Check if data URL
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If already URL, return as is
      return res.json({ url: imageBase64 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = mimeType.split('/')[1] || 'jpg';
    const cleanName = (name || 'upload').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${cleanName}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, buffer);
    const fileUrl = `/uploads/${fileName}`;

    res.json({ url: fileUrl });
  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: 'Failed to process image upload' });
  }
});

export default router;
