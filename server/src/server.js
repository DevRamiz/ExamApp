import http from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { attachWebSocketServer } from "./websocket.js";

const server = http.createServer(app);
attachWebSocketServer(server);

server.listen(env.port, () => {
  console.log(`ExamFlow API listening on port ${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing server.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
