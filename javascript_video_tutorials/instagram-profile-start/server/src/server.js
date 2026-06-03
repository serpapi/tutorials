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
        profile_id: profileId,
        api_key: process.env.SERPAPI_API_KEY,
    });

    // console.log("Data", json);
    res.json(json);
});

app.get('/api/instagram/posts/:profileId', async (req, res) => {
    const { profileId } = req.params;
    const posts = [];
    let nextPageId;
    let params = {
        engine: 'instagram_profile',
        profile_id: profileId,
        api_key: process.env.SERPAPI_API_KEY,
    }

    for (let i = 0; i < 5; i++) {
        if (nextPageId != null) {
            params.next_page_token = nextPageId;
        }
        const json = await getJson(params);
        posts.push(...json.profile_results.posts)
    }

    res.json(posts)
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
