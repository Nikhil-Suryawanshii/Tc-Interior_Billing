import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { uploadsDir } from './config/paths.js';
import { asyncHandler } from './lib/asyncHandler.js';
import api from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/api/v1', asyncHandler(async (req, _res, next) => {
  if (req.path !== '/health') await connectDb();
  next();
}));
app.use('/api/v1', api);
app.use(notFound);
app.use(errorHandler);

async function start() {
  await fs.mkdir(path.join(uploadsDir, 'company'), { recursive: true });
  await fs.mkdir(path.join(uploadsDir, 'products'), { recursive: true });
  await fs.mkdir(path.join(uploadsDir, 'pdfs'), { recursive: true });
  await connectDb();
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
    console.log('Connected to MongoDB Atlas');
  });
}

export default app;

// Vercel imports the Express app as a function. Keep filesystem setup and
// app.listen() for local development only; function storage is ephemeral.
if (process.env.VERCEL !== '1') {
  start().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
