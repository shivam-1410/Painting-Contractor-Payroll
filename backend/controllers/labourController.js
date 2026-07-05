const Labour = require("../models/Labour");
const Payroll = require("../models/Payroll");
const Transfer = require("../models/Transfer");

exports.createLabour =
async (req, res) => {

  try {

    const labour =
      await Labour.create({

        ...req.body,

        siteHistory: [

          {

            site:
              req.body.assignedSite,

            fromDate:
              new Date(),

            active: true,

          },

        ],

      });

    res.status(201).json(
      labour
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};

exports.getLabours =
async (req, res) => {

  try {

    const labours =
      await Labour.find()

      .populate("assignedSite")

      .populate(
        "siteHistory.site"
      );

    res.json(labours);

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};

exports.updateLabour =
async (req, res) => {

  try {

    const labour =
      await Labour.findById(
        req.params.id
      );

    if (!labour) {

      return res.status(404).json({

        message:
          "Labour not found",

      });

    }

    if (

      req.body.assignedSite &&

      labour.assignedSite?.toString() !==

        req.body.assignedSite

    ) {

      labour.siteHistory.forEach(
        (history) => {

          if (history.active) {

            history.active = false;

            history.toDate =
              new Date();

          }

        }
      );

      labour.siteHistory.push({

        site:
          req.body.assignedSite,

        fromDate:
          new Date(),

        active: true,

      });

    }

    labour.name =
      req.body.name;

    labour.phone =
      req.body.phone;

    labour.dailyWage =
      req.body.dailyWage;

    labour.assignedSite =
      req.body.assignedSite;

    await labour.save();

    res.json(labour);

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};

exports.deleteLabour =
async (req, res) => {

  try {

    const labourId = req.params.id;

    // Delete all payroll records linked to this labourer
    await Payroll.deleteMany({ labour: labourId });

    // Delete all transfer history records linked to this labourer
    await Transfer.deleteMany({ labour: labourId });

    // Delete the labourer document itself
    await Labour.findByIdAndDelete(labourId);

    res.json({

      message:
        "Labour and associated records (except attendance) deleted successfully",

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};