import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // COMPATIBILITY: Use path relative to the built server location
  // When bundled, the server will be in dist/index.cjs, so the public files
  // are in the parent directory's sibling 'public' folder
  const distPath = path.resolve(__dirname, "../public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // CLEAN: Fall through to index.html for client-side routing
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
