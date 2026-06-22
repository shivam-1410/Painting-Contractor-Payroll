const express = require("express");

const router = express.Router();

const {
  getTransfers,
} = require(
  "../controllers/transferController"
);

router.get("/", getTransfers);

module.exports = router;