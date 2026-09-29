import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getJson } from 'serpapi';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the server' });
});

app.post('/api/search', async (req, res) => {
  const { query } = req.body;

  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'A text query is required' });
  }

  try {
    const response = await getJson({
      engine: "youtube_channel",
      channel_id: query.trim(),
      api_key: process.env.SERPAPI_API_KEY
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
