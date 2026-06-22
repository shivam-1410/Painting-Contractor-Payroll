const express = require("express");

const router = express.Router();

const {
  createSite,
  getSites,
  updateSite,
  deleteSite,
  getLabourHistory,
} = require("../controllers/SiteController");
const siteController =
require("../controllers/SiteController");

console.log(siteController);

router.post("/", createSite);

router.get("/", getSites);

router.put("/:id", updateSite);

router.delete("/:id", deleteSite);

router.get(
  "/history/:labourId",
  getLabourHistory
);

module.exports = router;