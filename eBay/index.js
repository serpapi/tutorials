import dotenv from "dotenv";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer";
dotenv.config();
const apiKey = process.env.API_KEY;

getJson({
    api_key: apiKey,
    engine: "ebay",
    _nkw: "coffee mugs",
    _ipg: 25,
    ebay_domain: "ebay.ca",
    json_restrictor: "organic_results"
}, (json) => {
    console.log("Number of results: ", json.organic_results.length)
    console.log(colorize(json));
});