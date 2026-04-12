const express = require("express");
const router = express.Router();
const { chat, getScenarios } = require("../controllers/aiController");

router.get("/scenarios", getScenarios);
router.post("/chat", chat);

module.exports = router;
