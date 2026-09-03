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

const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'image/x-icon': 'ico',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff'
};

// POST /api/upload
router.post('/', async (req, res) => {
  try {
    const { imageBase64, name } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 string is required' });
    }

    // If it's already an uploaded file path or HTTP URL, return as is
    if (typeof imageBase64 === 'string' && /^(https?:|\/uploads\/|uploads\/)/i.test(imageBase64.trim())) {
      const cleanUrl = imageBase64.trim();
      return res.json({ url: cleanUrl.startsWith('/') || cleanUrl.startsWith('http') ? cleanUrl : `/${cleanUrl}` });
    }

    // Match base64 Data URL, supporting multi-line base64 & arbitrary mime types
    const matches = imageBase64.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const rawMime = matches[1].toLowerCase().trim();
    const base64Data = matches[2].replace(/[\r\n\s]+/g, ''); // Strip linebreaks & whitespace
    const buffer = Buffer.from(base64Data, 'base64');

    // Extract extension safely
    const ext = MIME_TO_EXT[rawMime] || rawMime.split('/')[1]?.split('+')[0]?.split('.')[0] || 'jpg';

    // Remove existing extension from provided name if present
    const nameWithoutExt = (name || 'upload').replace(/\.[^/.]+$/, '');
    const cleanName = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 50) || 'upload';

    const fileName = `${cleanName}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, buffer);
    const fileUrl = `/uploads/${fileName}`;

    res.json({ url: fileUrl });
  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: 'Failed to process image upload: ' + err.message });
  }
});

export default router;

