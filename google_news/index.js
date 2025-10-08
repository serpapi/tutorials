import dotenv from "dotenv";
import { getJson } from "serpapi";
import fs from "fs"
dotenv.config();
const apiKey = process.env.API_KEY;
const categories = []
const googleNews = await getJson({
    api_key: apiKey,
    engine: "google_news",
    gl: "ca",
    hl: 'en'
});

googleNews.menu_links.forEach(element => {
    categories.push({ title: element.title, topic_token: element.topic_token });
});

const categories2 = [{
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
}]
const newsByCategory = categories2.map(async (category) => {
    return getJson({
        api_key: apiKey,
        engine: "google_news",
        topic_token: category.topic_token,
        gl: "us",
        hl: 'en'
    });
})

const news = await Promise.all(newsByCategory);

news.forEach((item) => {
    console.log("CATEGORY: " + item.title)
    const topResults = item.news_results.slice(0, 5);
    topResults.forEach(res => {
        console.log(res.highlight? res.highlight.title : res.title)
    })
    console.log("")
    console.log("---------------------")
    console.log("")
})
