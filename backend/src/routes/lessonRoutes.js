const express = require("express");
const router = express.Router();
const {
  getAllLessons,
  getLessonById,
  getLessonExercises,
  saveProgress,
} = require("../controllers/lessonController");

router.get("/", getAllLessons);
router.get("/:id", getLessonById);
router.get("/:id/exercises", getLessonExercises);
router.post("/progress", saveProgress);

module.exports = router;
