import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  try {
    // Attempt primary MongoDB connection with a 5s server selection timeout
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB Atlas connection failed (${err.message}).`);
    
    // Attempt fallback to local MongoDB if available
    try {
      const localUri = "mongodb://127.0.0.1:27017/agripr_erp";
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`✅ Connected to local MongoDB fallback: ${localUri}`);
    } catch (localErr) {
      console.error("\n❌ COULD NOT CONNECT TO MONGODB ATLAS OR LOCAL MONGO.");
      console.error("👉 To fix MongoDB Atlas Connection:");
      console.error("   1. Log into https://cloud.mongodb.com/");
      console.error("   2. Go to Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0) or add your current IP address.");
      console.error("   3. Or start a local MongoDB instance on mongodb://127.0.0.1:27017/agripr_erp\n");
    }
  }
}

