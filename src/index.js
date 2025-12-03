import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import dbConnect from "./config/database/dbConfig.js";
import router from "./routes/index.js";
import { app } from "./utils/socket.js";
import express from "express";
import cors from "cors";
import "./utils/cron.js";
import { connectSocket } from "./socket/socket.Connection.js";
let server;
dotenv.config();
app.use(
  cors({
    origin: "*",
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("uploads"));

// Routes
app.use(router);

// DB connect
dbConnect();

// Start server
const PORT = process.env.PORT || 5000;

server = app.listen(PORT, () => console.log(`✅ Server running at ${PORT}`));
connectSocket(server);
