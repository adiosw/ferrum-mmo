import { useEffect, useRef, useCallback } from "react";
import io, { Socket } from "socket.io-client";

interface SocketEvents {
  "player-joined": (data: { playerId: number; x: number; y: number }) => void;
  "army-movement": (data: { armyId: string; playerId: number; from: [number, number]; to: [number, number]; arrivalTime: number }) => void;
  "army-arrived": (data: { armyId: string; playerId: number; location: [number, number] }) => void;
  "battle-occurred": (data: { attacker: number; defender: number; result: string; timestamp: number }) => void;
  "chat-message": (data: { playerId: number; message: string; timestamp: number }) => void;
  "resource-update": (data: { villageId: string; resources: Record<string, number> }) => void;
  "building-complete": (data: { villageId: string; buildingType: string; level: number }) => void;
  "unit-recruited": (data: { villageId: string; unitType: string; count: number }) => void;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  useEffect(() => {
    // Initialize socket connection
    const socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket.io] Connected");
    });

    socket.on("disconnect", () => {
      console.log("[Socket.io] Disconnected");
    });

    socket.on("error", (error) => {
      console.error("[Socket.io] Error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ) => {
    if (!socketRef.current) return;

    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    socketRef.current.on(event, callback as any);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback as any);
      }
      listenersRef.current.get(event)?.delete(callback);
    };
  }, []);

  const emit = useCallback(<K extends keyof SocketEvents>(
    event: K,
    data: any
  ) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return {
    socket: socketRef.current,
    on,
    emit,
    isConnected: socketRef.current?.connected ?? false,
  };
}
