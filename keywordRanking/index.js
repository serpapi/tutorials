import dotenv from "dotenv";
import { getJson } from "serpapi";

dotenv.config();
const apiKey = process.env.API_KEY;

const keywords = [
    "coffee",
    "iced coffee",
    "americano",
    "cortado",
    "latte",
    "matcha",
    "pumpkin spice latte",
    "oatmilk latte",
];


//   the domain to check the rankings of
const domain = "starbucks.com";


const getRanking = (data) => {
    const index = data.organic_results.findIndex(result =>
        result.displayed_link.includes(domain)
    );

    return index !== -1 ? index + 1 : "N/A";
}


//Get ranking for multiple keywords
const responses = keywords.map(async (keyword) =>
    getJson({
        api_key: apiKey,
        engine: "google_light_fast",
        google_domain: "google.com",
        q: keyword,//required 
        gl: "us"
    })
);

const json = await Promise.all(responses);



keywords.forEach((keyword, i) => {
    console.log(`The ranking for "${keyword}" is: ${getRanking(json[i])}`);
});