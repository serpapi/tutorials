import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import { getJson } from 'serpapi';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));

app.get('/api/instagram/:profileId', async (req, res) => {
  const { profileId } = req.params;

  const params = {
    engine: 'instagram_profile',
    profile_id: profileId,
    api_key: process.env.SERPAPI_API_KEY,
  };

  try {
    const json = await getJson(params);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from SerpApi' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
