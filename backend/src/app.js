import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiters.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
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
