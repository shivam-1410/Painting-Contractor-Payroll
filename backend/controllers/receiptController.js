const Payroll = require("../models/Payroll");

exports.generateReceipt = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate("labour").sort({ createdAt: -1 });
    
    const receipts = payrolls.map(p => ({
      _id: p._id,
      labourId: p.labour?._id || p.labour,
      labourName: p.labour?.name || p.labourName || "Deleted Labour",
      phone: p.labour?.phone || p.phone || "",
      siteName: p.siteName || "N/A",
      dailyWage: p.labour?.dailyWage || p.dailyWage || 0,
      presentDays: p.presentDays,
      halfDays: p.halfDays,
      overtime: p.overtime,
      teaExpense: p.teaExpense,
      bhada: p.bhada,
      advance: p.advance,
      totalSalary: p.totalSalary,
      month: p.month + " " + p.year
    }));

    res.json(receipts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};