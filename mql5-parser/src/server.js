import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import signalRoutes from './routes/signals.js';
import userRoutes from './routes/users.js';
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';
import { initDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/signals', verifyToken, signalRoutes);
app.use('/api/users', verifyToken, userRoutes);

// Error handling
app.use(errorHandler);

// Database initialization
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

export default app;