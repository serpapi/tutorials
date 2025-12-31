import dotenv from "dotenv";
import path from "path";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer"
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });
const apiKey = process.env.API_KEY;

try {
    const data = await getJson({
        api_key: apiKey,
        engine: "youtube",
        search_query: "hockey highlights",
    })
    console.log(data.shorts_results.length);

    // data?.shorts_results.forEach(group =>
    //     group.shorts.forEach(video => {
    //         console.log(`Title: ${video.title}`)
    //         console.log("Views: " + video.views);
    //         console.log("Thumbnail: " + video.thumbnail);
    //         console.log("------------------------")
    //     })
    // )
} catch (error) {
    console.error("Error fetching data", error)
}