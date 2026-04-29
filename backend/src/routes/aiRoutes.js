const express = require("express");
const router = express.Router();
const {
  chat,
  getScenarios,
  evaluatePronunciation,
  transcribeAudio,
} = require("../controllers/aiController");

router.get("/scenarios", getScenarios);
router.post("/chat", chat);
router.post("/evaluate-pronunciation", evaluatePronunciation);
router.post("/transcribe", transcribeAudio);

module.exports = router;
