const express = require("express");
const router = express.Router();
const {
  getUserStats,
  awardXP,
} = require("../controllers/gamificationController");

router.get("/stats/:user_id", getUserStats);
router.post("/award-xp", awardXP);

module.exports = router;
