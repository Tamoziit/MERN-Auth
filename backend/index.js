import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectToMongoDB from "./db/connectToMongoDB.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.get("/api/v1", (req, res) => {
    res.send("<h1>Auth server up & running</h1>");
});

app.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server is listening on Port: ${PORT}`);
})
