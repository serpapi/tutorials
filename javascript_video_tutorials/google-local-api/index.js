import dotenv from "dotenv";
import { getJson } from "serpapi";
dotenv.config();
const apiKey = process.env.API_KEY;

try {
    const data = await getJson({
        api_key: apiKey,
        engine: "google_local",
        google_domain: "google.ca",
        q: "pizza",
        hl: "en",
        gl: "ca",
        location: "Vancouver, British Columbia, Canada",
    })

    const ids = data.local_results.map(item => item.place_id).slice(0, 5);

    const fetchRequests = ids.map((id) => {
        return getJson({
            api_key: apiKey,
            engine: "google_maps_posts",
            data_id: id
        })
    })

    const results = await Promise.all(fetchRequests);

    results.forEach((account) => {
        if (account?.posts !== undefined) {
            console.log(account.posts[0])
        }
    })
} catch (error) {
    console.error("Error fetching data: ", error)
}