import { useEffect } from "react";

export function useRealtimeNotifications(onNotification) {
  useEffect(() => {
    const token = localStorage.getItem("examflow_token");
    if (!token) return undefined;

    let socket;
    let reconnectTimer;
    let stopped = false;
    let attempts = 0;

    const connect = () => {
      const explicitUrl = import.meta.env.VITE_WS_URL;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const baseUrl = explicitUrl || `${protocol}//${window.location.host}/ws`;
      const separator = baseUrl.includes("?") ? "&" : "?";
      socket = new WebSocket(`${baseUrl}${separator}token=${encodeURIComponent(token)}`);

      socket.onopen = () => { attempts = 0; };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type !== "connected") onNotification(message, socket);
        } catch {
          // Ignore malformed optional real-time messages; HTTP remains the source of truth.
        }
      };
      socket.onclose = () => {
        if (stopped) return;
        attempts += 1;
        reconnectTimer = window.setTimeout(connect, Math.min(1000 * 2 ** attempts, 15_000));
      };
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [onNotification]);
}
