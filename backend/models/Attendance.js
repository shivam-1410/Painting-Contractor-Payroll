const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(

{

  labour: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "Labour",

    required: true,

  },

  labourName: {

    type: String,

  },

  status: {

    type: String,

    enum: [

      "Present",

      "Absent",

      "Half Day",

    ],

    default: "Present",

  },

  date: {

    type: Date,

    default: Date.now,

  },

  halfDay: {

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

},

{

  timestamps: true,

}

);

module.exports =

mongoose.model(

  "Attendance",

  attendanceSchema

);