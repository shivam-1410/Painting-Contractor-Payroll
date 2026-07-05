const SiteTransaction = require("../models/SiteTransaction");

// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  try {
    const transaction = await SiteTransaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// GET ALL TRANSACTIONS FOR A SITE
exports.getTransactionsBySite = async (req, res) => {
  try {
    const transactions = await SiteTransaction.find({ site: req.params.siteId })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE TRANSACTION
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await SiteTransaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
