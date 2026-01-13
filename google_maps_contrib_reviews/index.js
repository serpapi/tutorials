import dotenv from "dotenv";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer";

dotenv.config();
const apiKey = process.env.API_KEY;

const data = await getJson({
    api_key: apiKey,
    engine: "google_maps_contributor_reviews",
    contributor_id: "114293782448752999823",
})

console.log(colorize(data))