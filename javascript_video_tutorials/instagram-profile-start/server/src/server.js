import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import { getJson } from 'serpapi'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/api/instagram/:profileId', async (req, res) => {
    const { profileId } = req.params;
    const params = {
        engine: 'instagram_profile',
        profile_id: profileId,
        api_key: process.env.SERPAPI_API_KEY,
    }
    const json = await getJson(params);

    res.json(json);
});

app.get('/api/instagram/posts/:profileId', async (req, res) => {
    const { profileId } = req.params;
    const posts = [];
    let nextPageId = null;
    const params = {
        engine: 'instagram_profile',
        profile_id: profileId,
        api_key: process.env.SERPAPI_API_KEY,
    };

    try {
        for (let i = 0; i < 5; i++) {
            if (nextPageId != null) {
                params.next_page_token = nextPageId;
            }
            const json = await getJson(params);
            posts.push(...(json.profile_results?.posts ?? []));
            nextPageId = json.serpapi_pagination?.next_page_token ?? null;
            if (!nextPageId) break;
        }
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
