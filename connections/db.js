require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  const ora = await import('ora');
  const spinner = ora.default("Connecting to the database...").start();

  try {
    await mongoose.connect(process.env.DB_CONNECT_URL);
    spinner.succeed("Database Connection Success!");
  } catch (error) {
    spinner.fail("Failed to connect to the database.");
    console.error("Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
