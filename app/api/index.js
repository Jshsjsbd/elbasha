import { createRequestHandler } from "@react-router/express";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from build/client
app.use(express.static(join(__dirname, "../build/client"), {
  maxAge: '1y',
  immutable: true,
}));

// Handle all routes with React Router
app.all(
  "*",
  createRequestHandler({
    build: async () => import("../build/server/index.js"),
  })
);

export default app;