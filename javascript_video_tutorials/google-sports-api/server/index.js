import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { getJson } from "serpapi";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/getShots", async (req, res) => {
    const apiKey = process.env.API_KEY;
    const data = await getJson({
        api_key: apiKey,
        engine: "google_sports",
        kgmid: "/g/11xl36f_mr",
        sp: "ft",
        type: "game",
        hl: "en",
        no_cache: "true"
    })
    const { game_results } = data;
    // console.log("PASSES BY FRANCE:" + data.game_results.team_stats.teams[0].stats.filter(obj => obj.type === "PASSES")[0].value);
    // console.log("PASSES BY MORROCO:" + data.game_results.team_stats.teams[1].stats.filter(obj => obj.type === "PASSES")[0].value)
    res.json({
        spain: game_results.team_stats.teams[0].stats[0].value,
        belgium: game_results.team_stats.teams[1].stats[0].value,
        time: game_results.info.in_game_time
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
