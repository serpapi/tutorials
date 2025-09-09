import dotenv from "dotenv";
import { getJson } from "serpapi";
import fs, { write } from "fs";
import path from "path"

dotenv.config();
const apiKey = process.env.API_KEY;

const writeToCsv = (data) => {
  const csvContent = data.map(row => row.join(",")).join("\n");
  const filePath = path.join(process.cwd(), "output.csv");
  fs.writeFile(filePath, csvContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing CSV file:", err);
    } else {
      console.log("CSV file has been saved to", filePath);
    }
  });
}

getJson({
  engine: "google_maps",
  q: "Coffee",
  ll: "@40.76173745837114,-73.9774600487914,14z",
  api_key: apiKey,
}, (json) => {
  // const data = [];

  // data.push(["Name", "Phone", "Rating", "Reviews", "Address"]);
  // json.local_results.forEach(({ title, phone, rating, reviews, address }) => {
  //   data.push([title, phone, rating, reviews, `"${address}"`])
  // });

  // writeToCsv(data);
  console.log(json)
});