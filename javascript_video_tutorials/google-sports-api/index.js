import dotenv from "dotenv";
import { getJson } from "serpapi";
import fs from "fs";
dotenv.config();
const apiKey = process.env.API_KEY;

// const teams = [
//     { name: "England", index: 0, shots: 0, goals: 0 },
//     { name: "Argentina", index: 1, shots: 0, goals: 0 },
// ];

// setInterval(async () => {
//     const data = await getJson({
//         api_key: apiKey,
//         engine: "google_sports",
//         kgmid: "/g/11xl384gmf",
//         sp: "ft",
//         type: "game",
//         hl: "en",
//         no_cache: "true"
//     });
//     const { game_results } = data;

//     const { minute, second } = game_results.info.in_game_time;
//     const time = `${minute}:${String(second).padStart(2, "0")}`;

//     for (const team of teams) {
//         const shots = game_results.team_stats.teams[team.index].stats.find(stat => stat.type === "SHOTS").value;
//         const goals = game_results.info.teams[team.index].score;

//         console.log(`SHOTS BY ${team.name.toUpperCase()}: `, shots);
//         console.log(`GOALS BY ${team.name.toUpperCase()}: `, goals);

//         if (shots > team.shots) {
//             console.log(`${team.name} has taken a shot ${time}`);
//         }
//         if (goals > team.goals) {
//             console.log(`${team.name} has scored a goal ${time}`);
//         }

//         team.shots = shots;
//         team.goals = goals;
//     }
// }, 1000);



const form = new FormData();
form.append("image", new Blob([fs.readFileSync("/Users/catherine/Downloads/tiktok.jpg")]), "tiktok.jpg");
form.append("api_key", apiKey);

const response = await fetch("https://serpapi.com/image", {
    method: "POST",
    body: form,
});

const data = await response.json();
console.log(data);