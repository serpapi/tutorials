import OpenAI from "openai";
import dotenv from "dotenv";
import { getJson } from "serpapi"
dotenv.config();

//OpenAI API setup
const openAiKey = process.env.OPEN_AI_KEY;
const client = new OpenAI({ apiKey: openAiKey });

//SerpApi setup
const serpApiKey = process.env.SERP_API_KEY;

let appReviews;
try {

    const app = await getJson({
        api_key: serpApiKey,
        engine: "apple_app_store",
        term: "instagram",
        num: "5"
    });

    console.log("App", app)
    const appId = app?.organic_results[0]?.id;
    appReviews = await getJson({
        api_key: serpApiKey,
        engine: "apple_reviews",
        product_id: appId
    });
} catch (err) {
    console.error("Failed to fetch reviews from SerpApi:", err);
    process.exit(1);
}

const textReviews = appReviews?.reviews.map(review => review.text)

let response;
try {
    response = await client.responses.create({
        model: "gpt-5.4",
        input: `Given the list of comma-separated reviews for a mobile app, give me a summary of the main criticisms: ${textReviews.join(", ")}`,
    });
} catch (err) {
    console.error("Failed to get response from OpenAI:", err.message);
    process.exit(1);
}

console.log(response.output_text);
