import dotenv from 'dotenv';

dotenv.config();

export const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === expectedPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }
};
