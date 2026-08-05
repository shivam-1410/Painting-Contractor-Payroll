const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema({

  name: {

    type: String,

    required: true,

  },

  location: {

    type: String,

    required: true,

  },

  status: {

    type: String,

    enum: ["Active", "Completed", "Deleted"],

    default: "Active",

  },

  progress: {

    type: Number,

    default: 0,

  },

  contractorName: {

    type: String,

    default: "",

  },

  contractWorkValue: {

    type: Number,

    default: 0,

  },

  remarks: {

    type: String,

    default: "",

  },

  expectedNextPayment: {

    type: String,

    default: "",

  },

  useAutoMilestones: {

    type: Boolean,

    default: true,

  },


});

siteSchema.index({ status: 1 });

module.exports = mongoose.model(
  "Site",
  siteSchema
);