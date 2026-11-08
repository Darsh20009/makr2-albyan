import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { applySeoTemplate } from "./seo-template";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    index: false,
    setHeaders(res, filePath) {
      const normalizedPath = filePath.split(path.sep).join("/");
      if (normalizedPath.includes("/assets/")) {
        // Vite fingerprints every production asset; a changed file gets a new URL.
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (/\.(?:avif|gif|jpe?g|mp4|png|svg|webp|woff2?)$/i.test(filePath)) {
        // Reuse media across visits without pinning unversioned uploads indefinitely.
        res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
    },
  }));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    const template = fs.readFileSync(path.resolve(distPath, "index.html"), "utf8");
    res.type("html").send(applySeoTemplate(template, res.locals.seoDocument, res.locals.seoNoindex));
  });
}
