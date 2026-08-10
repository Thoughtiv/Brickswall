import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import { connectWithRetry } from './config/db.js';
import { initDatabase } from './models/schema.js';

import pricingRouter from './routes/pricing.js';
import inquiriesRouter from './routes/inquiries.js';
import projectsRouter from './routes/projects.js';
import testimonialsRouter from './routes/testimonials.js';
import settingsRouter from './routes/settings.js';
import chatbotRouter from './routes/chatbot.js';

// Load Env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

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

// Routes
app.use('/api/pricing', pricingRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/chat', chatbotRouter);

// Start Server after connecting to MySQL
connectWithRetry(initDatabase).then(() => {
  app.listen(PORT, () => {
    console.log(`Bricks Wall Server running on http://localhost:${PORT}`);
  });
});
