import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";

export interface RealtimeEvent {
  type:
    | "class:created"
    | "class:updated"
    | "class:deleted"
    | "access:requested"
    | "access:decided"
    | "enrollments:updated"
    | "connected"
    | "ping"
    | "pong";
  classId?: string;
  teacherId?: string;
  studentId?: string;
  decision?: string;
  timestamp: string;
  payload?: any;
}

let wss: WebSocketServer | null = null;

export function initRealtime(server: Server): WebSocketServer {
  (globalThis as any).__marinBroadcastRealtime = broadcastRealtimeEvent;

  if (wss) {
    return wss;
  }

  wss = new WebSocketServer({ server, path: "/api/realtime" });

  wss.on("connection", (ws: WebSocket) => {
    // Send immediate confirmation
    ws.send(
      JSON.stringify({
        type: "connected",
        timestamp: new Date().toISOString(),
      })
    );

    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.type === "ping") {
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch {}
    });

    ws.on("error", () => {});
  });

  return wss;
}

export function broadcastRealtimeEvent(
  event: Omit<RealtimeEvent, "timestamp">
) {
  if (!wss) return;
  const fullMessage: RealtimeEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  const serialized = JSON.stringify(fullMessage);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(serialized);
      } catch {}
    }
  });
}
