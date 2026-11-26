import { useEffect, useRef, useState, useCallback } from "react";

export interface RealtimeEvent {
  type: string;
  classId?: string;
  teacherId?: string;
  studentId?: string;
  decision?: string;
  timestamp: string;
  payload?: any;
}

interface UseRealtimeSyncOptions {
  onEvent?: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const { onEvent, enabled = true } = options;
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pollIntervalRef = useRef<any>(null);
  const failedAttemptsRef = useRef<number>(0);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startPollingFallback = useCallback(() => {
    if (pollIntervalRef.current || !enabled) return;
    pollIntervalRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      const tickEvent: RealtimeEvent = {
        type: "poll:tick",
        timestamp: new Date().toISOString(),
      };
      setLastEvent(tickEvent);
      onEventRef.current?.(tickEvent);
    }, 6000);
  }, [enabled]);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/realtime`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        failedAttemptsRef.current = 0;
        setIsConnected(true);
        stopPolling();
      };

      ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          setLastEvent(data);
          if (onEventRef.current) {
            onEventRef.current(data);
          }
        } catch {}
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        failedAttemptsRef.current += 1;

        if (!enabled) return;

        // If WebSocket is unavailable (e.g. serverless hosting like Vercel), fall back to silent polling
        if (failedAttemptsRef.current >= 2) {
          startPollingFallback();
        } else {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
      startPollingFallback();
    }
  }, [enabled, startPollingFallback, stopPolling]);

  useEffect(() => {
    connect();

    // Keepalive ping every 25s
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      stopPolling();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, stopPolling]);

  return { isConnected, lastEvent };
}
