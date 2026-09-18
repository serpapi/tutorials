import express, { json } from 'express';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3001;


app.use(cors());
app.use(json());

app.post('/api/message', async (req, res) => {

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Query is required" });
  }

  res.json({ reply: "Hello from the server" });

});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
