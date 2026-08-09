const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");
const auth = require("../middleware/auth");

router.post("/", auth, feedbackController.addFeedback);
router.get("/", auth, feedbackController.getFeedbacks);

module.exports = router;