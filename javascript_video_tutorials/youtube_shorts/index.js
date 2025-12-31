import dotenv from "dotenv";
import path from "path";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

const apiKey = process.env.API_KEY;
try {
    const data = await getJson({
        api_key: apiKey,
        engine: "youtube",
        search_query: "top programming languages 2025",
        json_restrictor: "shorts_results"
    })


    data?.shorts_results.forEach(row => {

        row.shorts.forEach(video => {
            console.log(`Title: ${video.title}`)
            console.log("Views: " + video.views);
            console.log("Thumbnail: " + video.thumbnail);
            console.log("------------------------")
        })

    })
} catch (error) {
    console.error("Error fetching data", error)
}