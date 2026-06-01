import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import { getJson } from 'serpapi'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/api/instagram', async (req, res) => {
    res.json({ message: "HELLO FROM SERVER" })
});
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
