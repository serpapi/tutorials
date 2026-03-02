import dotenv from "dotenv";
import { getJson } from "serpapi";
dotenv.config();
const apiKey = process.env.API_KEY;

try {
    const data = await getJson({
        api_key: apiKey,
        engine: "google_hotels_reviews",
        property_token: "ChgIxcfh_uu15MCCARoLL2cvMXRqeTF4MHoQAQ",
        category_token: "yumor3ica1yRnFiSmp5fVDl5eUBiUXZmXjoTjAEAtNkMAw",
        sort_by: 4
    })

    console.log(data)
} catch (error) {
    console.error("Error fetching data: ", error)
}