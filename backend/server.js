const express = require("express");
const cors = require("cors");

const db = require("./database/database");
const projectRoutes = require("./routes/projectRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const eventRoutes = require("./routes/eventRoutes");
const clientRoutes = require("./routes/clientRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "📸 StudioOS Backend Running 🚀",
  });
});

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/clients", clientRoutes);

// Test Database Route
app.get("/api/health", (req, res) => {
  db.get("SELECT datetime('now') AS currentTime", [], (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json({
      success: true,
      message: "Backend and SQLite are connected successfully.",
      databaseTime: row.currentTime,
    });
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log("======================================");
  console.log("📸 StudioOS Backend Started");
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📂 Projects API: http://localhost:${PORT}/api/projects`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
  console.log("======================================");
});