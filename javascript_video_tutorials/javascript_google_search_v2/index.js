import dotenv from "dotenv";
import { getJson } from "serpapi";
import fs from "fs"
dotenv.config();
const apiKey = process.env.API_KEY;

getJson({
    api_key: apiKey,
    q: "matcha",
    engine: "google",
    gl: "ca",
    location: "Vancouver, British Columbia, Canada",
    start: 10,
    no_cache: true
}, (json) => {
    const data = json.organic_results;
    data.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title} - ${result.link}`);
        console.log("Snippet:", result.snippet);
        console.log("-----");
        console.log("")
    });
   
})