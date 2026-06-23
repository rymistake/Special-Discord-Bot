import mongoose from "mongoose";

export const moderationConnection = mongoose.createConnection();

export async function connectModerationMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  await moderationConnection.openUri(process.env.MONGO_URI, {
    dbName: "iris-moderation",
  });

  console.log("MongoDB moderation DB connected");
  console.log("Connected moderation DB:", moderationConnection.db?.databaseName);
}