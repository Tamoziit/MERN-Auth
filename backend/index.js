import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import connectToMongoDB from "./db/connectToMongoDB.js";
import authRoutes from "./routes/auth.routes.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/api/v1", (req, res) => {
    res.send("<h1>Auth server up & running</h1>");
});

app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server is listening on Port: ${PORT}`);
})
