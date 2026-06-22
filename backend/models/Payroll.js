const mongoose = require("mongoose");

const payrollSchema =
new mongoose.Schema({

  labour: {

    type:
      mongoose.Schema.Types.ObjectId,

    ref: "Labour",

    required: true,

  },

  month: {

    type: String,

    required: true,

  },

  year: {

    type: Number,

    required: true,

  },

  presentDays: {

    type: Number,

    default: 0,

  },

  halfDays: {

    type: Number,

    default: 0,

  },

  nightShift: {

    type: Number,

    default: 0,

  },

  teaExpense: {

    type: Number,

    default: 0,

  },

  bhada: {

    type: Number,

    default: 0,

  },

  advance: {

    type: Number,

    default: 0,

  },

  totalSalary: {

    type: Number,

    default: 0,

  },

  paymentStatus: {

    type: String,

    enum: [
      "Pending",
      "Paid",
    ],

    default: "Pending",

  },

  closed: {

    type: Boolean,

    default: false,

  },

  closedAt: Date,

},
{
  timestamps: true,
});

module.exports =
mongoose.model(
  "Payroll",
  payrollSchema
);