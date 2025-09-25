import {getJson} from "serpapi";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const apiKey = process.env.API_KEY;

const results = await getJson({
    api_key: apiKey,
    q: "matcha",
    gl: "ca"
}, (json) => {
    console.log(json)
});

//Write to file
fs.writeFileSync("results2.json", JSON.stringify(results, null, 2), "utf-8");