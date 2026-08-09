const express = require("express");
const router = express.Router();

const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  purchaseGoal,
} = require("../controllers/goalController");

const auth = require("../middleware/auth");

router.post("/", auth, createGoal);
router.get("/", auth, getGoals);
router.put("/:id", auth, updateGoal);
router.put("/:id/purchase", auth, purchaseGoal);
router.delete("/:id", auth, deleteGoal);

module.exports = router;