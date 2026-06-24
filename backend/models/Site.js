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

    enum: ["Active", "Completed"],

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

});

module.exports = mongoose.model(
  "Site",
  siteSchema
);