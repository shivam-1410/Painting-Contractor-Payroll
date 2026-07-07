const Labour = require("../models/Labour");

const Attendance = require(
  "../models/Attendance"
);

exports.getSalaryData = async (req, res) => {
  try {
    const [labours, attendances] = await Promise.all([
      Labour.find().lean(),
      Attendance.find().lean()
    ]);

    // Group attendance records by labour ID in memory
    const attendanceByLabour = {};
    attendances.forEach(record => {
      if (record.labour) {
        const labourId = record.labour.toString();
        if (!attendanceByLabour[labourId]) {
          attendanceByLabour[labourId] = [];
        }
        attendanceByLabour[labourId].push(record);
      }
    });

    const salaryData = labours.map((labour) => {
      const attendance = attendanceByLabour[labour._id.toString()] || [];

      const presentDays = attendance.filter(
        (item) => item.status === "Present"
      ).length;

      const halfDays = attendance.reduce(
        (sum, item) => sum + (item.halfDay || 0),
        0
      );

      const overtime = attendance.reduce(
        (sum, item) => sum + (item.overtime || item.nightShift || 0),
        0
      );

      const teaExpense = attendance.reduce(
        (sum, item) => sum + (item.teaExpense || 0),
        0
      );

      const bhada = attendance.reduce(
        (sum, item) => sum + (item.bhada || 0),
        0
      );

      const advance = attendance.reduce(
        (sum, item) => sum + (item.advance || 0),
        0
      );

      const baseSalary = presentDays * labour.dailyWage;
      const halfSalary = halfDays * (labour.dailyWage / 2);
      const overtimeWage = overtime * (labour.dailyWage / 8);

      const totalSalary =
        baseSalary +
        halfSalary +
        overtimeWage +
        teaExpense +
        bhada -
        advance;

      return {
        labourId: labour._id,
        labourName: labour.name,
        presentDays,
        halfDays,
        overtime,
        teaExpense,
        bhada,
        advance,
        totalSalary,
      };
    });

    res.json(salaryData);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};