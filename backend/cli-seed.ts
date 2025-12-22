#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import { connectMongo } from "./mongo";
import { storage } from "./storage";

async function run() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }
  await connectMongo(uri);
  await storage.seedAdmin();
  console.log("Seeding complete");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
