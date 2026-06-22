const mongoose = require("mongoose");

const labourSchema =
new mongoose.Schema({

  name: {

    type: String,

    required: true,

  },

  phone: {

    type: String,

    required: true,

  },

  dailyWage: {

    type: Number,

    required: true,

  },

  assignedSite: {

    type:
      mongoose.Schema.Types.ObjectId,

    ref: "Site",

  },

  joiningDate: {

    type: Date,

    default: Date.now,

  },

  siteHistory: [

    {

      site: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Site",

      },

      fromDate: {

        type: Date,

        default: Date.now,

      },

      toDate: {

        type: Date,

        default: null,

      },

      active: {

        type: Boolean,

        default: true,

      },

    },

  ],

});

module.exports = mongoose.model(
  "Labour",
  labourSchema
);