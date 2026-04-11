const pool = require("../config/db");

// GET all lessons
const getAllLessons = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lessons ORDER BY order_number ASC",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single lesson with vocabulary
const getLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const lesson = await pool.query("SELECT * FROM lessons WHERE id = $1", [
      id,
    ]);
    if (lesson.rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const vocabulary = await pool.query(
      "SELECT * FROM vocabulary WHERE lesson_id = $1",
      [id],
    );

    res.status(200).json({
      lesson: lesson.rows[0],
      vocabulary: vocabulary.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET exercises for a lesson
const getLessonExercises = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM exercises WHERE lesson_id = $1",
      [id],
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST save progress
const saveProgress = async (req, res) => {
  const { user_id, lesson_id, score } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO progress (user_id, lesson_id, completed, score, completed_at)
       VALUES ($1, $2, true, $3, NOW())
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET score = $3, completed = true, completed_at = NOW()
       RETURNING *`,
      [user_id, lesson_id, score],
    );
    res.status(200).json({
      message: "Progress saved!",
      progress: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllLessons,
  getLessonById,
  getLessonExercises,
  saveProgress,
};
