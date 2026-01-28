import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();

app.use(express.static("build/client"));

app.all(
  "*",
  createRequestHandler({
    build: () => import("../build/server/index.js"),
  })
);

export default app;