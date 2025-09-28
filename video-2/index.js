import {getJson} from "serpapi";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.API_KEY;

getJson({
    api_key: apiKey,
    q: "matcha",
    gl: "ca"
}, (json) => {
    const data = json.organic_results;
    data.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title} - ${result.link}`);
        console.log("Snippet:", result.snippet);
        console.log("-----");
    });
    
});

