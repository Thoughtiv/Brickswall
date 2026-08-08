import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import { connectWithRetry } from './config/db.js';
import { initDatabase } from './models/schema.js';

import pricingRouter from './routes/pricing.js';
import inquiriesRouter from './routes/inquiries.js';

// Load Env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
const corsOptions = {
  origin: '*',
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

// Start Server after connecting to MySQL
connectWithRetry(initDatabase).then(() => {
  app.listen(PORT, () => {
    console.log(`Bricks Wall Server running on http://localhost:${PORT}`);
  });
});
