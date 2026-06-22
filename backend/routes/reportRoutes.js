const express = require("express");

const router = express.Router();

const {

  getAttendanceReport,

  getPaymentReport,

} = require(
  "../controllers/reportController"
);

router.get(
  "/attendance",
  getAttendanceReport
);

router.get(
  "/payment",
  getPaymentReport
);

module.exports = router;