const express = require("express");

const router = express.Router();

const {
  markAttendance,
  getAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

router.post("/", markAttendance);

router.get("/", getAttendance);

router.delete("/:id", deleteAttendance);

module.exports = router;