require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { seedDatabase } = require("./src/services/seeder");

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("MongoDB connected successfully!");

    // First run: if the collections are empty, load data/*.json into MongoDB
    if (await seedDatabase()) console.log("Collections were empty - loaded data from /data/*.json");

    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

startServer();
