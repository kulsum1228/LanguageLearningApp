const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");

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

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Marathi Learning App API is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
