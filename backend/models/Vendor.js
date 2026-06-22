const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: true,
    },

    mobile: String,

    address: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Vendor",
  vendorSchema
);