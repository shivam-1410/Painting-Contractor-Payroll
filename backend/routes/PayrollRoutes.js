const express = require("express");

const router = express.Router();

const {

  generatePayroll,

  getPayrolls,

  markAsPaid,

} = require(
  "../controllers/PayrollController"
);

router.post(
  "/generate",
  generatePayroll
);

router.get(
  "/",
  getPayrolls
);

router.put(
  "/pay/:id",
  markAsPaid
);

module.exports = router;