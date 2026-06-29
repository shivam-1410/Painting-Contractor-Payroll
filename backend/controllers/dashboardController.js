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
      labours,
      payrolls,
      recentAttendance,
      recentPayments,
      attendanceCounts
    ] = await Promise.all([
      Labour.countDocuments(),
      Site.countDocuments({ status: "Active" }),
      Attendance.countDocuments({ status: "Present" }),
      Labour.find().lean(),
      Payroll.find().lean(),
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
        { $group: { _id: "$labour", count: { $sum: 1 } } }
      ])
    ]);

    // Create a fast lookup map for present days per labour
    const attendanceMap = {};
    attendanceCounts.forEach((item) => {
      if (item._id) {
        attendanceMap[item._id.toString()] = item.count;
      }
    });

    // Calculate pending payments using the pre-aggregated counts
    let pendingPayments = 0;
    for (const labour of labours) {
      const presentDays = attendanceMap[labour._id.toString()] || 0;
      pendingPayments += presentDays * (labour.dailyWage || 0);
    }

    // Calculate monthly payroll
    const monthlyPayroll = payrolls.reduce(
      (sum, payroll) => sum + (payroll.totalSalary || 0),
      0
    );

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