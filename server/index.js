import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, '../data/library.json');

app.use(cors());
app.use(express.json());

// Initialize library database if it doesn't exist
function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

initDb();

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

// Save Library (Complete overwrite for simplicity since state is synced from frontend)
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

app.listen(PORT, () => {
  console.log(`[GameTrack Server] Running at http://localhost:${PORT}`);
});
