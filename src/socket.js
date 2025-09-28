import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // change to your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join room with userId for personal notifications
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    }

    // Disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

// Function to emit notification to a specific user
export const sendNotificationToUser = (userId, notification) => {
  console.log("Sending notification to user:", userId, notification);
  if (io) {
    io.to(userId.toString()).emit("notification", notification);
  }
};

export const sendNotificationToAdmin = (userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit("AdminNotification", notification);
  }
};
// Function to broadcast to all users (optional)
export const broadcastNotification = (notification) => {
  if (io) {
    io.emit("notification", notification);
  }
};

export { io };
