import { io } from "socket.io-client";
import { setOnlineUsers } from "../slices/chatSlice";

let socket = null;

export const initSocket = (token, dispatch) => {
  if (socket?.connected) return socket;

  socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:4000", {
    auth: { token },
    transports: ["websocket"],
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("disconnect", () => console.log("Socket disconnected"));
  socket.on("online_users", (users) => dispatch(setOnlineUsers(users)));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};
