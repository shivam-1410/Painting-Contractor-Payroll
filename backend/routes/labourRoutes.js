const express = require("express");

const router = express.Router();

const {
  createLabour,
  getLabours,
  deleteLabour,
  updateLabour,
} = require("../controllers/labourController");

// Create Labour
router.post("/", createLabour);

// Get All Labours
router.get("/", getLabours);

router.delete("/:id", deleteLabour);

router.put("/:id", updateLabour);

module.exports = router;