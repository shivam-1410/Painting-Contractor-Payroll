const Challan = require("../models/Challan");

// CREATE CHALLAN

exports.createChallan = async (
  req,
  res
) => {
  try {
    const {
      challanNo,
      vendor,
      site,
      billDate,
      items,
    } = req.body;

    // Check if a challan with this number already exists
    let existing = await Challan.findOne({ challanNo });

    if (existing) {
      // Migrate legacy items to have site field if they don't already
      existing.items = existing.items.map(item => {
        if (!item.site) {
          item.site = existing.site;
        }
        return item;
      });

      // Append new items to the existing items array with site reference
      const itemsWithSite = items.map(item => ({ ...item, site }));
      existing.items.push(...itemsWithSite);

      // Update fields if provided (pre-save hook will automatically recalculate totalAmount)
      if (site) {
        if (!existing.sites || existing.sites.length === 0) {
          existing.sites = existing.site ? [existing.site] : [];
        }
        existing.site = site;
        const siteStr = site.toString();
        const hasSite = existing.sites.some(s => s.toString() === siteStr);
        if (!hasSite) {
          existing.sites.push(site);
        }
      }
      if (billDate) existing.billDate = billDate;
      if (vendor) existing.vendor = vendor;

      await existing.save();
      const updatedChallan = await Challan.findById(existing._id).populate("site").populate("sites");
      return res.status(200).json(updatedChallan);
    }

    const totalAmount =
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.amount),
        0
      );

    const itemsWithSite = items.map(item => ({ ...item, site }));

    const challan =
      await Challan.create({
        challanNo,
        vendor,
        site,
        sites: [site],
        billDate,
        items: itemsWithSite,
        totalAmount,
      });

    const populatedChallan = await Challan.findById(challan._id).populate("site").populate("sites");
    res.status(201).json(populatedChallan);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });

  }
};

// GET ALL CHALLANS

exports.getChallans = async (
  req,
  res
) => {
  try {

    const challans =
      await Challan.find()

        .populate("site")
        .populate("sites")

        .sort({
          billDate: -1,
        });

    res.json(challans);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });

  }
};

// GET SINGLE CHALLAN

exports.getSingleChallan =
  async (req, res) => {

    try {

      const challan =
        await Challan.findById(
          req.params.id
        )

          .populate("site")
          .populate("sites");

      if (!challan) {

        return res
          .status(404)
          .json({
            message:
              "Challan not found",
          });

      }

      res.json(challan);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });

    }
  };

// DELETE CHALLAN

exports.deleteChallan =
  async (req, res) => {

    try {

      const challan =
        await Challan.findByIdAndDelete(
          req.params.id
        );

      if (!challan) {

        return res
          .status(404)
          .json({
            message:
              "Challan not found",
          });

      }

      res.json({
        message:
          "Challan deleted successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });

    }
  };

// GET CHALLANS BY SITE

exports.getSiteChallans =
  async (req, res) => {

    try {

      const challans =
        await Challan.find({
          $or: [
            { site: req.params.siteId },
            { sites: req.params.siteId },
          ],
        })
          .populate("site")
          .populate("sites")
          .sort({
            billDate: -1,
          });

      res.json(challans);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });

    }
  };

// GET CHALLANS BY VENDOR

exports.getVendorChallans =
  async (req, res) => {

    try {

      const challans =
        await Challan.find({
          vendor:
            req.params.vendorId,
        })

          .populate("site")
          .populate("sites")

          .sort({
            billDate: -1,
          });

      res.json(challans);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });

    }
  };