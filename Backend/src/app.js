const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/events.routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => res.send("Recommended Events Backend is running!"));
app.use("/api", eventRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
