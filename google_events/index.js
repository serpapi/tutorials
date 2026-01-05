import dotenv from "dotenv";
import path from "path";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer"
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });
const apiKey = process.env.API_KEY;

try {
    const data = await getJson({
        api_key: apiKey,
        engine: "google_ai_mode",
        q: "How can I lose 5 pounds in a month safely, without losing muscle mass? I have a knee injury, and cannot do cardio aside from walking.",
        hl: "en",
        gl: "ca",
        google_domain: "google.ca",
        location: "Vancouver, British Columbia, Canada"
    })
    console.log(colorize(data))
    // data?.text_blocks.forEach((textBlock) => {
    //     console.log("\n");
    //     if (textBlock.type === "list") {
    //         textBlock.list.forEach((item) => console.log(` - ` + item?.snippet))
    //     } else {
    //         console.log(textBlock?.snippet)
    //     }
    // })

} catch (error) {
    console.error("Error fetching data", error)
}