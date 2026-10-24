// Manual reset: npm run seed  (wipes and reloads everything from /data/*.json)
require("dotenv").config();
const mongoose = require("mongoose");
const { seedDatabase } = require("./services/seeder");

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  await seedDatabase({ force: true });
  const names = await mongoose.connection.db.listCollections().toArray();
  for (const { name } of names) {
    if (name.startsWith("system.")) continue;
    console.log(`${name}: ${await mongoose.connection.db.collection(name).countDocuments()} documents`);
  }
  await mongoose.disconnect();
})().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
