import dotenv from "dotenv";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer";
dotenv.config();
const apiKey = process.env.API_KEY;

// getJson({
//     api_key: apiKey,
//     engine: "google",
//     gl: 'fj',
//     q: "how to brew coffee",

// }, (searchResult) => {
//     if (searchResult?.ai_overview === undefined) {
//         console.log("No AI Overview");
//         return;
//     }
//     console.log("*** AI OVERVIEW ***")

//     const pageToken = searchResult.ai_overview?.page_token
//     if (pageToken === undefined) {
//         console.log(colorize(searchResult.ai_overview));
//     } else {
//         console.log("*** API REQUEST TO AI OVERVIEW API ***")
//         getJson({
//             api_key: apiKey,
//             engine: "google_ai_overview",
//             page_token: pageToken
//         }, (aiOverview) => console.log(colorize(aiOverview)))

//     }
// })

const test = await getJson({
    api_key: apiKey,
    engine: "google",
    gl: 'fj',
    q: "how to brew coffee",
});

console.log("TEST", test);
