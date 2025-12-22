import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // prefer backend/public, fallback to ../frontend/dist
  const candidatePaths = [
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "frontend/dist"),
    path.resolve(process.cwd(), "../frontend/dist"),
  ];

  const distPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!distPath) {
    throw new Error(`Could not find the build directory. Build the frontend first.`);
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
