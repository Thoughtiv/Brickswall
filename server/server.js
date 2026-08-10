import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectWithRetry } from './config/db.js';
import { initDatabase } from './models/schema.js';

import pricingRouter from './routes/pricing.js';
import inquiriesRouter from './routes/inquiries.js';
import projectsRouter from './routes/projects.js';
import testimonialsRouter from './routes/testimonials.js';
import settingsRouter from './routes/settings.js';
import chatbotRouter from './routes/chatbot.js';

// Load .env from the same directory as server.js (works on any host)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://brickswall.in',
    'https://www.brickswall.in'
  ];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman, or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`Origin ${origin} blocked by CORS`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Health / debug endpoint (safe – passwords are masked)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'running',
    cwd: process.cwd(),
    dirname: __dirname,
    env: {
      PORT: process.env.PORT,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT SET',
      GROQ_API_KEY: process.env.GROQ_API_KEY ? '***SET***' : 'NOT SET',
      FRONTEND_URL: process.env.FRONTEND_URL
    }
  });
});

// Routes
app.use('/api/pricing', pricingRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/chat', chatbotRouter);

// Start server immediately so Hostinger's 3-second listen() check passes
app.listen(PORT, () => {
  console.log(`Bricks Wall Server running on http://localhost:${PORT}`);
});

// Connect to DB after server is already listening (non-blocking)
connectWithRetry(initDatabase).catch((err) => {
  console.error('Fatal: Could not connect to database after retries.', err?.message);
});
