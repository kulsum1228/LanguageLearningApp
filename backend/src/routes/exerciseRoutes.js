const express = require("express");
const router = express.Router();
const { generateExercises } = require("../controllers/exerciseController");

router.get("/generate/:lesson_id", generateExercises);

module.exports = router;
