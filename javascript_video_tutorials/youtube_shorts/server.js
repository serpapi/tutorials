import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import { getJson } from "serpapi";

dotenv.config();
const apiKey = process.env.API_KEY;
const app = express();
app.use(cors());
// Basic route

const engine = "youtube";
const query = "fall fashion 2025"
app.get("/", async (req, res) => {
    let data;
    let thumbnails = []
    try {
        data = await getJson({
            api_key: apiKey,
            engine: engine,
            search_query: query
        })
        const shorts = data.shorts_results[0].shorts.slice(0, 5);

        const fetchShortsThumbnails = shorts.map(item =>
            getJson({
                api_key: apiKey,
                engine: "youtube_video",
                v: item.video_id
            })
        )
        const shortsDetails = await Promise.all(fetchShortsThumbnails)

        thumbnails = shortsDetails.map(item => item.thumbnail)
        console.log(thumbnails)
    } catch (error) {
        data = error
        console.log("error", error)
    }
    res.json({ message: "Heeeey" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});