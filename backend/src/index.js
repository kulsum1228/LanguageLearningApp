const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");
const exerciseRoutes = require("./routes/exerciseRoutes");
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const aiRoutes = require("./routes/aiRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/exercises", exerciseRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Marathi Learning App API is running!" });
});

app.get("/transcribe-test", (req, res) => {
  try {
    const FormData = require("form-data");
    const fetch = require("node-fetch");
    res.json({
      formDataAvailable: !!FormData,
      fetchAvailable: !!fetch,
      nodeVersion: process.version,
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
