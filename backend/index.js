import "dotenv/config";
import express from "express";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import { FILES_PUBLIC_PREFIX } from "./utils/uploadStorage.js";

connectDB();

const app = express();
const allowedOrigins = new Set([
  "https://app.hcsb.org.bd",
  "https://siraatulmustaqim.com",
  "https://www.siraatulmustaqim.com",
  "https://admin.siraatulmustaqim.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "https://siraatul-web-v2.netlify.app",
  "http://127.0.0.1:3001",
  "https://siraatul-web.netlify.app",
  "https://siraatul-backend.hcsb.org.bd"
]);

const corsOptions = {
  origin(origin, callback) {
    console.log("CORS Origin:", origin);
    if (!origin) {
      return callback(null, true);
    }

    const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
    const ngrokOriginPattern = /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i;

    if (
      allowedOrigins.has(origin) ||
      localOriginPattern.test(origin) ||
      ngrokOriginPattern.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://siraatul-web.netlify.app",
// ];

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }
//   res.setHeader("Access-Control-Allow-Credentials", "true");
app.options(/.*/, cors(corsOptions));
//     "Access-Control-Allow-Methods",
//     "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Content-Type,Authorization,X-Requested-With"
//   );

//   // Handle preflight requests immediately
//   if (req.method === "OPTIONS") {
//     return res.status(204).end();
//   }

//   next();
// });

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(FILES_PUBLIC_PREFIX, express.static(path.join(process.cwd(), "data")));
app.use("/api/files", express.static(path.join(process.cwd(), "data")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", routes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running successfully and routed ready to use.",
  });
});
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on("join:live", (roomName) => {
    if (roomName) {
      socket.join(`live:${roomName}`);
      console.log(`[Socket] ${socket.id} joined live:${roomName}`);
    }
  });

  socket.on("leave:live", (roomName) => {
    if (roomName) {
      socket.leave(`live:${roomName}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
