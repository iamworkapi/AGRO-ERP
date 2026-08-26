import mongoose from "mongoose";
import { env } from "./env.js";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 30000,
    }).then((m) => {
      console.log(`✅ MongoDB connected: ${m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB Atlas connection error:", e.message);
    throw e;
  }

  return cached.conn;
}
