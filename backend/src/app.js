import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./modules/common/middleware/errorHandler.js";
import { apiLimiter } from "./modules/common/middleware/rateLimiters.js";

export const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    const allowed = env.corsOrigin;
    if (!origin || allowed.includes(origin)) return cb(null, true);
    // In production (Vercel), the deployment subdomain changes per deploy.
    // Reflect back the Origin so same-origin requests from the Vercel frontend
    // are always accepted.
    if (env.nodeEnv === "production") return cb(null, true);
    cb(new Error(`Origin "${origin}" not allowed by CORS`));
  },
  credentials: true,
}));
// Default 100kb is too small for the employee-photo data URIs the
// Employees form can submit (see employee.validator.js's ~700k char cap) -
// raised just enough to cover that, not left unbounded.
app.use(express.json({ limit: "1mb" }));
// Strips any request key starting with "$" or containing "." (e.g. a login
// identifier of {"$gt": ""}) before it can reach a Mongoose query - zod
// already rejects non-string shapes on most fields, this is the
// defense-in-depth layer for anything that isn't strictly typed.
app.use(mongoSanitize());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Matches VITE_API_BASE_URL in the frontend (.env.example: /api/v1).
app.use("/api/v1", apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);
