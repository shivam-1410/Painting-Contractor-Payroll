const Transfer = require("../models/Transfer");

exports.getTransfers = async (
  req,
  res
) => {

  try {

    const transfers =
      await Transfer.find()

        .populate("labour")

        .populate("fromSite")

        .populate("toSite")

        .sort({
          transferDate: -1,
        });

    res.json(transfers);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};