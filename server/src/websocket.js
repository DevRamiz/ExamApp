import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { setNotificationBroadcaster } from "./services/notificationService.js";
import { markOffline, recordHeartbeat } from "./services/monitoringService.js";

function canReceive(client, event) {
  if (!client.user) return false;
  if (event.targetUserId && Number(event.targetUserId) !== client.user.id) return false;
  if (Array.isArray(event.targetUserIds) && !event.targetUserIds.map(Number).includes(client.user.id)) return false;
  if (event.targetRole && client.user.role !== event.targetRole) return false;
  return true;
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  const broadcast = (event) => {
    const message = JSON.stringify({ ...event, sentAt: event.sentAt || new Date().toISOString() });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN && canReceive(client, event)) client.send(message);
    }
  };

  wss.on("connection", async (socket, request) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const payload = jwt.verify(url.searchParams.get("token"), env.jwtSecret);
      const result = await pool.query("SELECT id, role, is_active FROM users WHERE id = $1", [Number(payload.sub)]);
      const user = result.rows[0];
      if (!user || !user.is_active) throw new Error("Inactive user");
      socket.user = { id: user.id, role: user.role };
      socket.send(JSON.stringify({ type: "connected", message: "Real-time connection established." }));
    } catch {
      socket.close(1008, "Unauthorized");
      return;
    }

    socket.on("message", async (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type !== "exam_heartbeat" || socket.user.role !== "student") return;
        const result = await recordHeartbeat(socket.user.id, message);
        socket.activeSubmissionId = Number(message.submissionId);
        broadcast({ type: "exam_monitor_update", targetUserId: result.lecturerId, monitor: result.monitor });
      } catch (error) {
        socket.send(JSON.stringify({ type: "realtime_error", message: error.message || "Invalid real-time message." }));
      }
    });

    socket.on("close", async () => {
      if (socket.user?.role === "student" && socket.activeSubmissionId) {
        await markOffline(socket.activeSubmissionId, socket.user.id);
      }
    });
  });

  setNotificationBroadcaster(broadcast);
  return wss;
}
