const mongoose = require("mongoose");

const challanSchema = new mongoose.Schema(
  {
    challanNo: {
      type: String,
      required: true,
    },

    vendor: {
      type: String,
      required: true,
    },

    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },

    billDate: {
      type: Date,
      required: true,
    },

    items: [
      {
        itemName: String,

        liter: String,

        qty: Number,

        rate: Number,

        amount: Number,
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// AUTO CALCULATE TOTAL

challanSchema.pre("save", function () {
  this.totalAmount = this.items.reduce(
    (sum, item) =>
      sum +
      Number(item.amount || (Number(item.qty || 0) * Number(item.rate || 0))),
    0
  );
});

module.exports = mongoose.model(
  "Challan",
  challanSchema
);