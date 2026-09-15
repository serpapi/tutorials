import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH_JSON = path.join(__dirname, "..", "serpapi-results.json");
const OUTPUT_PATH_MD = path.join(__dirname, "..", "serpapi-results.md");

export function writeMcpResults(mcpCalls) {
  const jsonResults = [];
  const mdSections = [];
  mcpCalls.forEach((call) => {
    try {
      jsonResults.push({ name: call.name, arguments: call.arguments, output: JSON.parse(call.output) });
    } catch {
      mdSections.push(`## ${call.name}\n\n${call.output}\n`);
    }
  });

  if (jsonResults.length) {
    fs.writeFileSync(OUTPUT_PATH_JSON, JSON.stringify(jsonResults, null, 2));
    console.log(`[serpapi] wrote results to ${OUTPUT_PATH_JSON}`);
  }
  if (mdSections.length) {
    fs.writeFileSync(OUTPUT_PATH_MD, mdSections.join("\n---\n\n"));
    console.log(`[serpapi] wrote results to ${OUTPUT_PATH_MD}`);
  }
}
