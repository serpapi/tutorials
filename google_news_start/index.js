import dotenv from "dotenv";
import { getJson } from "serpapi";
import { colorize } from "json-colorizer";
import fs from "fs";
dotenv.config();
const apiKey = process.env.API_KEY;

const topNews = await getJson({
    api_key: apiKey,
    engine: "google_news",
    gl: "ca",
    hl: 'en'
})

console.log(colorize(topNews))

topNews.menu_links.forEach(element => {
    console.log({ title: element.title, topic_token: element.topic_token })
});
const categories = [
    {
        title: 'Technology',
        topic_token: 'CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKRFFTZ0FQAQ'
    },
    {
        title: 'Entertainment',
        topic_token: 'CAAqKggKIiRDQkFTRlFvSUwyMHZNREpxYW5RU0JXVnVMVWRDR2dKRFFTZ0FQAQ'
    },
    {
        title: 'Sports',
        topic_token: 'CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp1ZEdvU0JXVnVMVWRDR2dKRFFTZ0FQAQ'
    },
    {
        title: 'Science',
        topic_token: 'CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKRFFTZ0FQAQ'
    },
    {
        title: 'Health',
        topic_token: 'CAAqJQgKIh9DQkFTRVFvSUwyMHZNR3QwTlRFU0JXVnVMVWRDS0FBUAE'
    }
]

const newsFetchPromises = categories.map(async (category) => {
    return getJson({
        api_key: apiKey,
        engine: "google_news",
        topic_token: category.topic_token,
        gl: "us",
        hl: 'en'
    });
})

const newsByCategory = await Promise.all(newsFetchPromises);

newsByCategory.forEach((item) => {
    console.log("CATEGORY: " + item.title)
    const topResults = item.news_results.slice(0, 5);
    topResults.forEach(res => {
        console.log(res.highlight? res.highlight.title : res.title)
    })
    console.log("")
    console.log("---------------------")
    console.log("")
})