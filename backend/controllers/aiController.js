const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");

router.post("/caption", async (req, res, next) => {
  try {
    const { imageBase64, context } = req.body;
    if (!imageBase64) {
      console.error("Missing imageBase64 in request body", req.body);
      return res.status(400).json({ message: "imageBase64 is required" });
    }
    if (typeof imageBase64 !== "string" || imageBase64.length < 100) {
      console.error("Invalid imageBase64 string", imageBase64);
      return res.status(400).json({ message: "Invalid imageBase64 string" });
    }
    const result = await aiService.generateCaptions({ imageBase64, context });
    res.json(result);
  } catch (err) {
    console.error("Error in /api/ai/caption:", err);
    next(err);
  }
});

module.exports = router;
