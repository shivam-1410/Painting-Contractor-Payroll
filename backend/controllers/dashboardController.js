const Labour = require("../models/Labour");
const Attendance = require("../models/Attendance");
const Site = require("../models/Site");
const Payroll = require("../models/Payroll");
console.log("Attendance =", Attendance);
exports.getDashboardData = async (req, res) => {
  try {
    const [
      totalLabours,
      totalSites,
      totalAttendance,
      recentAttendance,
      recentPayments,
      pendingPaymentsResult,
      payrollSumResult
    ] = await Promise.all([
      Labour.countDocuments(),
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
      Attendance.aggregate([
        { $match: { status: "Present" } },
        {
          $group: {
            _id: "$labour",
            presentCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "labours",
            localField: "_id",
            foreignField: "_id",
            as: "labourInfo"
          }
        },
        { $unwind: "$labourInfo" },
        {
          $group: {
            _id: null,
            totalPending: {
              $sum: { $multiply: ["$presentCount", "$labourInfo.dailyWage"] }
            }
          }
        }
      ]),
      Payroll.aggregate([
        {
          $group: {
            _id: null,
            totalSalarySum: { $sum: "$totalSalary" }
          }
        }
      ])
    ]);

    const pendingPayments = pendingPaymentsResult[0]?.totalPending || 0;
    const monthlyPayroll = payrollSumResult[0]?.totalSalarySum || 0;

    res.json({
      totalLabours,
      totalAttendance,
      totalSites,
      pendingPayments,
      monthlyPayroll,
      recentAttendance,
      recentPayments,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};