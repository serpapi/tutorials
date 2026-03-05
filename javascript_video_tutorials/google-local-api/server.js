import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer";
dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;
const apiKey = process.env.API_KEY;

app.get("/search", async (req, res) => {
  const query = req.query.q || "matcha";
  const localResults = [];

  try {
    const data = await getJson({
      api_key: apiKey,
      engine: "google_local",
      google_domain: "google.ca",
      q: query,
      hl: "en",
      gl: "ca",
      location: "Vancouver, British Columbia, Canada",
    });

    data.local_results.forEach((localRes) =>
      localResults.push(localRes.place_id)
    );
    localResults.splice(5);

    const fetchRequests = localResults.map((id) => {
      return getJson({
        api_key: apiKey,
        engine: "google_maps",
        google_domain: "google.ca",
        hl: "en",
        data_cid: id,
      })
    })

    const response = await Promise.all(fetchRequests);

    console.log(colorize(response));
    const reviewData = response.map((res) => {
      return {
        name: res.place_results.title,
        reviews: res.place_results?.user_reviews?.most_relevant ?? []
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
