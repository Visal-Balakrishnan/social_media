import { io } from "socket.io-client";

const socket = io("http://localhost:7000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
});

socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("disconnect", (reason) => console.log("❌ Socket disconnected:", reason));
socket.on("connect_error", (err) => console.error("🚨 Socket connection error:", err.message));

export default socket;