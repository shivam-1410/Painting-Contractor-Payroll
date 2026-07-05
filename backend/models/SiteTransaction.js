const mongoose = require("mongoose");

const siteTransactionSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Payment Received",  // Received from Contractor/Party
        "Vendor Payout",     // Paid to material vendors
        "Labour Payout",     // Paid to workers
        "Other Expense"      // Transport, tea, misc
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    partyName: {
      type: String, // Name of contractor, vendor or person
      required: true,
    },
    reference: {
      type: String, // e.g., UPI, Cheque, Bank Transfer ID
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

siteTransactionSchema.index({ site: 1 });
siteTransactionSchema.index({ date: -1 });

module.exports = mongoose.model("SiteTransaction", siteTransactionSchema);
