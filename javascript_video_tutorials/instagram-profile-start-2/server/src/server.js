import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import { getJson } from 'serpapi'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/instagram/:profileId', async (req, res) => {
    const { profileId } = req.params;
    const json = await getJson({
        engine: 'instagram_profile',
        api_key: process.env.SERPAPI_API_KEY,
        profile_id: profileId,
        no_cache: true,
    })
    res.json(json)
});

app.get('/api/instagram/posts/:profileId', async (req, res) => {
    const { profileId } = req.params;
    const posts = [];
    const params = {
        engine: 'instagram_profile',
        api_key: process.env.SERPAPI_API_KEY,
        profile_id: profileId
    }
    let nextPageToken = null;
    try {
        for (let i = 0; i < 5; i++) {
            if (nextPageToken != null) {
                params.next_page_token = nextPageToken;
            }
            const json = await getJson(params);
            posts.push(...json.profile_results?.posts ?? [])
            nextPageToken = json.serpapi_pagination?.next_page_token ?? null;
            if (!nextPageToken) break;
        }
        res.json(posts)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
