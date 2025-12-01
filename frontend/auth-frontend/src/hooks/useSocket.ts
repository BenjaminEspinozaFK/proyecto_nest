import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001"; // URL del backend

export const useSocket = (userId?: string, isAdmin: boolean = false) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al servidor Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Conectado a Socket.IO:", socket.id);

      // Unirse a las salas correspondientes
      if (isAdmin) {
        socket.emit("join-room", "admin");
        console.log("👨‍💼 Unido a sala de administradores");
      }

      if (userId) {
        socket.emit("join-room", `user:${userId}`);
        console.log(`👤 Unido a sala de usuario: ${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado de Socket.IO");
    });

    socket.on("connect_error", (error: Error) => {
      console.error("❌ Error de conexión Socket.IO:", error);
    });

    // Cleanup al desmontar
    return () => {
      socket.disconnect();
      console.log("🔌 Socket desconectado (cleanup)");
    };
  }, [userId, isAdmin]);

  return socketRef.current;
};
