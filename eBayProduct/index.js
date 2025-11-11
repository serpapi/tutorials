import dotenv from "dotenv";
import { getJson } from "serpapi";
dotenv.config();
const apiKey = process.env.API_KEY;

try {
    const data = await getJson({
        api_key: apiKey,
        engine: "ebay_product",
        product_id: "375538468672"
    })
    console.log("Product data fetched successfully", data)
} catch (error) {
    console.error("Error fetching product data: ", error)
}