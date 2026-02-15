import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wellRoutes from './routes/wellRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { clearDatabase } from './services/dbService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Clear database on startup
clearDatabase().then(() => {
  console.log('Starting with fresh database');
}).catch(err => {
  console.error('Error clearing database:', err);
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Well Log Analyzer API' });
});

app.use('/api/wells', wellRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

