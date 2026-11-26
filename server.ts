import http from "http";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { app } from "./api/index";
import { initRealtime } from "./api/realtime";

const PORT = 3000;

async function startServer() {
  const server = http.createServer(app);

  // Initialize real-time WebSocket communication
  initRealtime(server);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`MARIN Academy server running on http://localhost:${PORT}`);
  });
}

startServer();
