import express, { json } from 'express';
import cors from 'cors';
import OpenAI from "openai";
import dotenv from "dotenv";
import { writeMcpResults } from "./writeMcpResults.js";

dotenv.config();
const app = express();
const PORT = 3001;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(json());

app.get('/api/message', async (req, res) => {

  // const { message } = req.body;
  try {
    console.log("Making OpenAI API call")
    const resp = await client.responses.create({
      model: "gpt-5-mini",
      reasoning: { effort: "low" },
      max_tool_calls: 3,
      instructions: "When calling SerpApi, use Google Maps engine.",
      tools: [
        {
          type: "mcp",
          server_label: "serpapi",
          server_description: "Web search via SerpApi",
          server_url: `https://mcp.serpapi.com/${process.env.SERPAPI_API_KEY}/mcp`,
          require_approval: "never",
        },
      ],
      input: "Find the three top rated matcha cafes in Vancouver, British Columbia, Canada right now. Filter for cafes with wheelchair accessible bathrooms",
    });

    const mcpCalls = resp.output.filter((item) => item.type === "mcp_call");
    writeMcpResults(mcpCalls);
    console.log("RESPONSE: ", resp.output_text)
    res.json({ reply: resp.output_text });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Something went wrong" });
  }

});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
