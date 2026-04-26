const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

// userId -> socketId map for online tracking
const onlineUsers = new Map();

exports.initSocket = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);

    // Broadcast updated online list
    io.emit("online_users", Array.from(onlineUsers.keys()));

    // Join a private room between two users
    socket.on("join_room", ({ roomId }) => {
      socket.join(roomId);
    });

    // Send message
    socket.on("send_message", async ({ roomId, receiverId, content }) => {
      try {
        const message = await Message.create({
          roomId,
          sender: userId,
          receiver: receiverId,
          content,
        });
        const populated = await message.populate("sender", "firstName lastName image");
        io.to(roomId).emit("receive_message", populated);
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicators
    socket.on("typing", ({ roomId }) => {
      socket.to(roomId).emit("user_typing", { userId });
    });
    socket.on("stop_typing", ({ roomId }) => {
      socket.to(roomId).emit("user_stop_typing", { userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};

exports.getOnlineUsers = () => Array.from(onlineUsers.keys());
