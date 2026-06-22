const express = require("express");

const router = express.Router();

const {
  getSalaryData,
} = require(
  "../controllers/salaryController"
);

router.get(
  "/",
  getSalaryData
);

module.exports = router;