import dotenv from "dotenv";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer";

dotenv.config();
const apiKey = process.env.API_KEY;

getJson({
    api_key: apiKey,
    q: "how do you brew coffee",
    no_cache: true,
    gl: "fj",
}, (searchResult) => {
    if (searchResult?.ai_overview === undefined) {
        console.log("No AI Overview");
        return;
    }
    console.log("*** AI OVERVIEW ***");
    console.log(colorize(searchResult.ai_overview));

    const pageToken = searchResult.ai_overview?.page_token;
    if (pageToken === undefined) {
        console.log(colorize(searchResult.ai_overview));
    } else {
        //Need to make another API call
        console.log("*** API REQUEST TO AI OVERVIEW API ***")

        getJson({
            api_key: apiKey,
            engine: "google_ai_overview",
            page_token: pageToken
        }, (aiOverview) => console.log(colorize(aiOverview.ai_overview)))
    }
})