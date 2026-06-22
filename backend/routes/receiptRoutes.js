const express = require("express");

const router = express.Router();

const {
  generateReceipt,
} = require(
  "../controllers/receiptController"
);

router.get("/", generateReceipt);

module.exports = router;