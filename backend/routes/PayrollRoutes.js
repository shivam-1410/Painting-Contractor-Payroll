const express = require("express");

const router = express.Router();

const {

  generatePayroll,

  getPayrolls,

  markAsPaid,

  markAsPending,

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

router.put(
  "/unpay/:id",
  markAsPending
);

module.exports = router;