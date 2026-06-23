import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// We use /tmp/library.json for Vercel, or a local file for local dev
const isVercel = process.env.VERCEL;
const DB_PATH = isVercel 
  ? '/tmp/library.json' 
  : path.join(process.cwd(), 'data/library.json');

function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    // If it's Vercel, copy seed data from the root folder data/library.json if it exists
    const seedPath = path.join(process.cwd(), 'data/library.json');
    if (isVercel && fs.existsSync(seedPath)) {
      try {
        fs.copyFileSync(seedPath, DB_PATH);
        return;
      } catch (err) {
        console.error('Failed to copy seed database:', err);
      }
    }
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

// Get Library
app.get('/api/library', (req, res) => {
  try {
    initDb();
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const library = JSON.parse(data);
    res.json(library);
  } catch (error) {
    console.error('Error reading library database:', error);
    res.status(500).json({ error: 'Failed to read library database' });
  }
});

// Save Library
app.post('/api/library', (req, res) => {
  try {
    initDb();
    const library = req.body;
    if (!Array.isArray(library)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array of games.' });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(library, null, 2), 'utf8');
    res.json({ success: true, count: library.length });
  } catch (error) {
    console.error('Error writing to library database:', error);
    res.status(500).json({ error: 'Failed to save library database' });
  }
});

export default app;
