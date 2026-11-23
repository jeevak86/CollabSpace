import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import { configureSockets } from "./sockets/documentSocket.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "300kb" }));

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true }
});
app.set("io", io);
configureSockets(io);

app.get("/", (_req, res) => res.json({ status: "ok", service: "CollabSpace API" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "CollabSpace API" }));
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT || 5000);
connectDB().then(() => {
  server.listen(port, () => console.log(`CollabSpace API listening on port ${port}`));
}).catch(error => {
  console.error("Database connection failed:", error.message);
  process.exit(1);
});
