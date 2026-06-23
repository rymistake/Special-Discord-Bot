import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URI!);
  mongoose.set("bufferCommands", false);
  console.log("MongoDB (Mongoose) connected");
  console.log("Connected DB:", mongoose.connection.db?.databaseName);
}