import OpenAI from "openai";
import dotenv from "dotenv";
import { getJson } from "serpapi"
dotenv.config();

//OpenAI API setup
const openAiKey = process.env.OPEN_AI_KEY;
const client = new OpenAI({ apiKey: openAiKey });

//SerpApi setup
const serpApiKey = process.env.SERP_API_KEY;

let reviews;
try {
    const app = await getJson({
        api_key: serpApiKey,
        engine: "apple_app_store",
        term: "instagram",
    });

    const appId = app?.organic_results[0]?.id;

    reviews = await getJson({
        api_key: serpApiKey,
        engine: "apple_reviews",
        product_id: appId,
    });

} catch (err) {
    onsole.error("Failed to fetch reviews from SerpApi:", err);
    process.exit(1);
}

const textReviews = reviews?.reviews.map(review => review.text);

try {
    const summary = await client.responses.create({
        model: "gpt-5.4",
        input: `Given the list of comma-separated reviews for a mobile app, give me a summary of the main criticisms: ${textReviews.join(", ")}`,
    })
    console.log(summary?.output_text);
} catch (err) {
    console.error("Failed to get response from OpenAI:", err.message);
    process.exit(1);
}