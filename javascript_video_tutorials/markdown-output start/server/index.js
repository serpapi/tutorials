import express, { json } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import OpenAI from 'openai';

dotenv.config();
const app = express();
const PORT = 3001;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.use(cors());
app.use(json());

app.post('/api/message', async (req, res) => {

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Query is required" });
  }

  console.log("Making call to OpenAI");
  const response = await client.responses.create({
    model: "gpt-5-mini",
    instructions: "When calling SerpApi, use the Google Maps engine. Set params.z to 14. " +
      "Return items as a list. Do not ask any follow-up questions.",
    tools: [
      {
        type: "mcp",
        server_label: "serpapi",
        server_description: "Web search via SerpApi",
        server_url: `https://mcp.serpapi.com/${process.env.SERPAPI_API_KEY}/mcp`,
        require_approval: "never",
      },
    ],
    input: message,
  });
  console.log(response.output_text);
  res.json({ reply: "Hello from the server" });

});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
