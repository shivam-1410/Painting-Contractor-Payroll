const express = require("express");
const router = express.Router();
const siteTransactionController = require("../controllers/siteTransactionController");

router.post("/", siteTransactionController.createTransaction);
router.get("/site/:siteId", siteTransactionController.getTransactionsBySite);
router.delete("/:id", siteTransactionController.deleteTransaction);

module.exports = router;
