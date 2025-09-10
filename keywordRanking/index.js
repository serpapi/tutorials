import dotenv from "dotenv";
import { getJson } from "serpapi";

dotenv.config();
const apiKey = process.env.API_KEY;

const keywords = [
    "coffee",
    "iced coffee",
    // "oat latte",
    // "best coffee",
    // "americano",
    // "latte",
    // "matcha",
    "pumpkin spice latte",
    "oat milk latte",
];


//   the domain to check the rankings of
// const domain = "https://serpapi.com";

const data = await getJson({
    api_key: apiKey,
    engine: "google_light",
    google_domain: "google.com",
    q: keywords[0],//required 
    gl: "us"
})

console.log(data)
const responses = keywords.map(async (keyword) =>
    getJson({
        api_key: apiKey,
        engine: "google_light",
        google_domain: "google.com",
        q: keyword,//required 
        gl: "us"
    })
);

const json = await Promise.all(responses);

const getRanking = (data) => {
    const index = data.organic_results.findIndex(result =>
        result.displayed_link.includes(domain)
    );

    return index !== -1 ? index + 1 : "N/A";
}