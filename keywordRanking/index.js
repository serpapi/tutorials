import dotenv from "dotenv";
import { getJson } from "serpapi";
import fs from "fs";
import { get } from "http";
dotenv.config();
const apiKey = process.env.API_KEY;

const keywords = [
    "coffee",
    "iced coffee",
    // "best coffee",
    "cortado",
    "latte",
    "matcha",
    "pumpkin spice latte",
    "oatmilk latte",
];


//   the domain to check the rankings of
const domain = "starbucks.com";

// const data = await getJson({
//     api_key: apiKey,
//     engine: "google_light",
//     google_domain: "google.com",
//     q: keywords[0],//required 
//     gl: "us"
// })
// console.log(data);
const responses = keywords.map(async (keyword) =>
    getJson({
        api_key: apiKey,
        engine: "google_light",
        google_domain: "google.com",
        q: keyword,//required 
        gl: "us"
    })
);

const getRanking = (data) => {
    const index = data.organic_results.findIndex(result =>
        result.displayed_link.includes(domain)
    );

    return index !== -1 ? index + 1 : "N/A";
}
const json = await Promise.all(responses);
fs.writeFileSync("results.json", JSON.stringify(json, null, 2), "utf-8");

console.log(getRanking(json[1]));

keywords.forEach((keyword, i) => {
    console.log(`The ranking for "${keyword}" is: ${getRanking(json[i])}`);
});