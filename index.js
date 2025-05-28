require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbconnect = require("./connections/db");
const appRoutes = require("./routes/appRoutes");
const app = express();
const PORT = process.env.PORT;

const corsConfigurations = {
  origin: process.env.CORS_ORIGIN,
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

    await dbconnect();
    app.use(cookieParser());
    app.use("/api/auth", appRoutes);
    app.listen(PORT, () => {
      spinner.succeed(`Server running on port ${PORT}`);
    });
  } catch (error) {
    spinner.fail("Failed to start the server.");
    console.error(error.message);
    process.exit(1);
  }
})();
