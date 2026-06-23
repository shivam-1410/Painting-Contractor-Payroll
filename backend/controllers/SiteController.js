const Site = require("../models/Site");
const Attendance = require("../models/Attendance");

// CREATE SITE
exports.createSite = async (req, res) => {

  try {

    const site =
      await Site.create(req.body);

    res.status(201).json(site);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// GET SITES
exports.getSites = async (req, res) => {

  try {

    const sites =
      await Site.find();

    res.json(sites);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// UPDATE SITE
exports.updateSite = async (req, res) => {

  try {

    const site =
      await Site.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true,
        }

      );

    res.json(site);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// DELETE SITE
exports.deleteSite = async (req, res) => {

  try {

    await Site.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Site deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// LABOUR HISTORY
exports.getLabourHistory = async (req, res) => {

  try {

    const labourId =
      req.params.labourId;

    const {
      fromDate,
      toDate,
    } = req.query;

    const filter = {
      labour: labourId,
    };

    if (
      fromDate &&
      toDate
    ) {

      filter.date = {

        $gte:
          new Date(fromDate),

        $lte:
          new Date(toDate),

      };

    }

    const records =
      await Attendance.find(filter)

      .sort({
        date: -1,
      });

    const summary = {

      presentDays: 0,

      halfDays: 0,

      overtime: 0,

      teaExpense: 0,

      bhada: 0,

      advance: 0,

    };

    const uniquePresentDates =
      new Set();

    records.forEach(
      (record) => {

        const dateKey =
          new Date(
            record.date
          )

            .toISOString()

            .split("T")[0];

        if (
          record.status ===
          "Present"
        ) {

          uniquePresentDates.add(
            dateKey
          );

        }

        summary.halfDays +=
          record.halfDay || 0;

        summary.overtime +=
          record.overtime || record.nightShift || 0;

        summary.teaExpense +=
          record.teaExpense || 0;

        summary.bhada +=
          record.bhada || 0;

        summary.advance +=
          record.advance || 0;

      }
    );

    summary.presentDays =
      uniquePresentDates.size;

    res.json({

      records,

      summary,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};