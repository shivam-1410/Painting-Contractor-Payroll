const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({

  labour: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "Labour",

    required: true,

  },

  fromSite: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "Site",

    required: true,

  },

  toSite: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "Site",

    required: true,

  },

  transferDate: {

    type: Date,

    default: Date.now,

  },

});

module.exports = mongoose.model(
  "Transfer",
  transferSchema
);