import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
import connectToSocket from './src/controllers/socketManager.js';
import userRoute from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
const server = createServer(app);
connectToSocket(server); // optional if you're using sockets

const port = process.env.PORT || 6001;
const uri = process.env.MONGO_URL;


app.use(cors({
    origin: 'http://localhost:5173', // frontend URL
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(cookieParser());
app.use("/api/v1/users", userRoute);



app.get("/", (req, res) => {
    res.send("Server is running");
});

const start = async () => {
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB connected");
        server.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err);
    }
};

start();
