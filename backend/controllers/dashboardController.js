const Labour = require("../models/Labour");
const Attendance = require("../models/Attendance");
const Site = require("../models/Site");
const Payroll = require("../models/Payroll");
console.log("Attendance =", Attendance);
exports.getDashboardData =
async (req, res) => {

  try {

    const totalLabours =
      await Labour.countDocuments();

    const totalSites =
      await Site.countDocuments({ status: "Active" });

    const totalAttendance =
      await Attendance.countDocuments({
        status: "Present",
      });

    const attendanceRecords =
      await Attendance.find()
      .populate("labour");

    let pendingPayments = 0;

    const labours =
      await Labour.find();

    for (const labour of labours) {

      const presentDays =
        attendanceRecords.filter(
          (item) =>
            item.labour &&
            item.labour._id.toString() ===
            labour._id.toString() &&
            item.status === "Present"
        ).length;

      pendingPayments +=
        presentDays *
        labour.dailyWage;

    }
    console.log(
      "Payroll Model:",
      Payroll
    );
    const payrolls =
      await Payroll.find();

    const monthlyPayroll =
      payrolls.reduce(
        (sum, payroll) =>
          sum +
          (payroll.totalSalary || 0),
        0
      );

    const recentAttendance =
      await Attendance.find()
      .populate("labour")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments =
      await Payroll.find()
      .populate("labour")
      .sort({ createdAt: -1 })
      .limit(5);

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
      message:
        error.message,
    });

  }

};