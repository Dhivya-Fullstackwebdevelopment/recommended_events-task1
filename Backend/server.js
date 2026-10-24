require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("MongoDB connected successfully!");

    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();