import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import dbConnect from "./config/database/dbConfig.js";
import router from "./routes/index.js";
import express from "express";
import cors from "cors";
import "./utils/cron.js";
import { connectSocket } from "./socket/socket.Connection.js";

const app = express();
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
app.get("/", (req, res) => {
  res.send({ status: true, message: " server is running successfully" });
});

app.use(router);

// DB connect
dbConnect();

// Start server
const PORT = process.env.PORT || 5000;

server = app.listen(PORT, () => {
  console.log(`✅ Server running at ${PORT}`);
  console.log(`🌐 Try: http://localhost:${PORT}/`);
});
connectSocket(server);
