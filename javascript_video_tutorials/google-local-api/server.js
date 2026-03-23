import express from "express";
import cors from "cors";
import { getJson } from "serpapi";
import dotenv from "dotenv";
import { colorize } from "json-colorizer";
dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;
const apiKey = process.env.API_KEY;

app.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const data = await getJson({
      api_key: apiKey,
      engine: "google_local",
      q: query,
      location: "Mount Pleasant, British Columbia, Canada",
    })

    const localIds = [];

    data.local_results.forEach(res => {
      localIds.push(res.place_id);
    })
    const fetchRequests = localIds.map(id => {
      return getJson({
        api_key: apiKey,
        engine: "google_maps",
        data_cid: id,
        json_restrictor: ["place_results"]
      })
    })

    const responses = await Promise.all(fetchRequests);

    const reviewData = responses.map(({ place_results }) => {
      return {
        name: place_results.title,
        reviews: place_results?.user_reviews?.most_relevant.splice(0, 3) ?? []
      }
    })
    res.json(reviewData);
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
