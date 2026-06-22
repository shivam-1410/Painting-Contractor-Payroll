const express = require("express");

const router = express.Router();

const {
  createChallan,
  getChallans,
  getSingleChallan,
  deleteChallan,
  getSiteChallans,
  getVendorChallans,
} = require("../controllers/ChallanController");

// Create Challan
router.post("/", createChallan);

// Get All Challans
router.get("/", getChallans);

// Get Challans By Site
router.get(
  "/site/:siteId",
  getSiteChallans
);

// Get Challans By Vendor
router.get(
  "/vendor/:vendorId",
  getVendorChallans
);

// Get Single Challan
router.get(
  "/:id",
  getSingleChallan
);

// Delete Challan
router.delete(
  "/:id",
  deleteChallan
);

module.exports = router;