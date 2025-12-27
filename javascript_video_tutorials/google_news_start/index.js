import dotenv from "dotenv";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer";
dotenv.config();
const apiKey = process.env.API_KEY;

const topNews = await getJson({
    api_key: apiKey,
    engine: "google_news",
    gl: "ca",
    hl: "en"
})

topNews.news_results.forEach(headline => {
    console.log(headline.highlight ? headline.highlight.title :
        headline.title
    )
})
