import dotenv from "dotenv";
import express, { type Request, Response, NextFunction } from "express";
// Load environment variables from .env into process.env (if present)
dotenv.config();
import { registerRoutes } from "./routes";

import { createServer } from "http";
import { connectMongo } from "./mongo";
import { storage } from "./storage";
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}
app.use("/api", (req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex");
  next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Allow cross-origin requests from the client dev server during development
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // allow requests with no origin (like curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        origin.includes("localhost:3000") ||
        origin.includes("127.0.0.1:3000") ||
        origin.includes("localhost:5173") ||
        origin.includes("127.0.0.1:5173") ||
        origin.includes("localhost:4173")||
        origin.includes("https://www.deepshift.in")||
        origin.includes("https://deepshift-psi.vercel.app/")||

      ) {
        return callback(null, true);
      }
      // In production, you may want to restrict this further
      return callback(null, true);
    },
    credentials: true,
  }),
);

// Admin rate limiter: configurable via env
const adminWindowMs = Number(process.env.ADMIN_RATE_WINDOW_MS || 60_000); // default 60s
const adminMax = Number(process.env.ADMIN_RATE_MAX || 60); // default 60 requests per window
const adminLimiter = rateLimit({
  windowMs: adminWindowMs,
  max: adminMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Apply rate limiter to admin API routes to protect heavy endpoints
app.use("/api/admin", adminLimiter);


export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB before registering routes which rely on models
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    console.warn("No MONGODB_URI or DATABASE_URL found. Server may fail to connect to DB.");
  } else {
    await connectMongo(mongoUri);
  }

  await registerRoutes(httpServer, app);

  // Ensure admin user is seeded (idempotent)
  try {
    await storage.seedAdmin();
  } catch (err) {
    console.error("Failed to run admin seed:", err);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

 

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
