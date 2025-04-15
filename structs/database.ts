import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const databaseUrl = process.env.DATABASE || ``;

if (!databaseUrl || databaseUrl.length == 0) {
  throw new Error("DATABASE is not defined in .env file");
}

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    await mongoose.connect(databaseUrl, {
    } as mongoose.ConnectOptions);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the process if the connection fails
  }
}