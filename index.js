require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const dbconnect = require("./connections/db");
const appRoutes = require("./routes/appRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 🔄 Let admin join a room so only they get the event
  socket.on("join-admin", () => {
    socket.join("admins");
    console.log(`Socket ${socket.id} joined 'admins' room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.set("io", io);

// CORS config
const corsConfigurations = {
  origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionSuccessStatus: 200,
};

(async () => {
  const ora = (await import("ora")).default;
  const spinner = ora("Starting server...").start();

  try {
    app.use(cors(corsConfigurations));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    await dbconnect();
    app.use("/api/auth", appRoutes);

    server.listen(PORT, () => {
      spinner.succeed(`Server running on port ${PORT}`);
    });
  } catch (error) {
    spinner.fail("Failed to start the server.");
    console.error(error.message);
    process.exit(1);
  }
})();
