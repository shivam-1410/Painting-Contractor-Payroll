const Labour = require("../models/Labour");
const Attendance = require("../models/Attendance");
const Site = require("../models/Site");
const Payroll = require("../models/Payroll");
console.log("Attendance =", Attendance);
let cachedDashboardData = null;
let lastCacheTime = 0;

exports.clearDashboardCache = () => {
  cachedDashboardData = null;
  lastCacheTime = 0;
};

exports.getDashboardData = async (req, res) => {
  try {
    const cacheDuration = 30000; // 30 seconds
    const now = Date.now();
    
    if (cachedDashboardData && (now - lastCacheTime < cacheDuration)) {
      return res.json(cachedDashboardData);
    }

    const dateObj = new Date();
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const currentMonthStr = months[dateObj.getUTCMonth()];
    const currentYearNum = dateObj.getUTCFullYear();

    const [
      totalLabours,
      totalSites,
      totalAttendance,
      recentAttendance,
      recentPayments,
      pendingPaymentsResult,
      payrollSumResult,
      yearlyExpenseResult
    ] = await Promise.all([
      Labour.estimatedDocumentCount(),
      Site.countDocuments({ status: "Active" }),
      Attendance.countDocuments({ status: "Present" }),
      Attendance.find()
        .populate("labour")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Payroll.find()
        .populate("labour")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Payroll.aggregate([
        { $match: { paymentStatus: "Pending" } },
        {
          $group: {
            _id: null,
            totalPending: { $sum: "$totalSalary" }
          }
        }
      ]),
      Payroll.aggregate([
        { $match: { month: currentMonthStr, year: currentYearNum } },
        {
          $group: {
            _id: null,
            totalSalarySum: { $sum: "$totalSalary" }
          }
        }
      ]),
      Payroll.aggregate([
        { $match: { year: currentYearNum } },
        {
          $group: {
            _id: null,
            yearlyTea: { $sum: "$teaExpense" },
            yearlyBhada: { $sum: "$bhada" },
            yearlyLabourCost: { $sum: { $add: ["$totalSalary", "$advance"] } }
          }
        }
      ])
    ]);

    const pendingPayments = pendingPaymentsResult[0]?.totalPending || 0;
    const monthlyPayroll = payrollSumResult[0]?.totalSalarySum || 0;
    const yearlyTea = yearlyExpenseResult[0]?.yearlyTea || 0;
    const yearlyBhada = yearlyExpenseResult[0]?.yearlyBhada || 0;
    const yearlyLabourCost = yearlyExpenseResult[0]?.yearlyLabourCost || 0;

    cachedDashboardData = {
      totalLabours,
      totalAttendance,
      totalSites,
      pendingPayments,
      monthlyPayroll,
      recentAttendance,
      recentPayments,
      yearlyTea,
      yearlyBhada,
      yearlyLabourCost,
    };
    lastCacheTime = now;

    res.json(cachedDashboardData);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};