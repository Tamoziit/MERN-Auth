import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import connectToMongoDB from "./db/connectToMongoDB.js";
import authRoutes from "./routes/auth.routes.js";

const PORT = process.env.PORT || 5000;
const app = express();
const __dirname = path.resolve();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1", (req, res) => {
    res.send("<h1>Auth server up & running</h1>");
});

app.use("/api/v1/auth", authRoutes);

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    })
}

app.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server is listening on Port: ${PORT}`);
})
