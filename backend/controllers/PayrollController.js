const Payroll = require(
    "../models/Payroll"
  );
  
  const Labour = require(
    "../models/Labour"
  );
  
  const Attendance = require(
    "../models/Attendance"
  );
  
  exports.generatePayroll =
  async (req, res) => {
  
    try {
  
      const { month, year } =
        req.body;
  
      const existingPayroll =
        await Payroll.findOne({
  
          month,
  
          year,
  
        });
  
      if (existingPayroll) {
  
        return res.status(400).json({
  
          message:
            "Payroll already generated for this month",
  
        });
  
      }
  
      const labours =
        await Labour.find();
  
      const payrollData =
        await Promise.all(
  
          labours.map(
            async (labour) => {
  
              const attendance =
                await Attendance.find({
  
                  labour:
                    labour._id,
  
                });
  
              const presentDays =
                attendance.filter(
  
                  (item) =>
                    item.status ===
                    "Present"
  
                ).length;
  
              const halfDays =
                attendance.reduce(
  
                  (sum, item) =>
  
                    sum +
                    (item.halfDay || 0),
  
                  0
  
                );
  
              const overtime =
                attendance.reduce(
  
                  (sum, item) =>
  
                    sum +
                    (item.overtime ||
                      item.nightShift ||
                      0),
  
                  0
  
                );
  
              const teaExpense =
                attendance.reduce(
  
                  (sum, item) =>
  
                    sum +
                    (item.teaExpense ||
                      0),
  
                  0
  
                );
  
              const bhada =
                attendance.reduce(
  
                  (sum, item) =>
  
                    sum +
                    (item.bhada || 0),
  
                  0
  
                );
  
              const advance =
                attendance.reduce(
  
                  (sum, item) =>
  
                    sum +
                    (item.advance ||
                      0),
  
                  0
  
                );
  
               const baseSalary =
                presentDays *
                labour.dailyWage;
  
              const halfSalary =
                halfDays *
                (labour.dailyWage /
                  2);
  
              const overtimeWage =
                overtime * (labour.dailyWage / 8);
  
              const totalSalary =
  
                baseSalary +
  
                halfSalary +
  
                overtimeWage -
  
                teaExpense -
  
                bhada -
  
                advance;
  
              return {
  
                labour:
                  labour._id,
  
                labourName:
                  labour.name,
  
                month,
  
                year,
  
                presentDays,
  
                halfDays,
  
                overtime,
  
                teaExpense,
  
                bhada,
  
                advance,
  
                totalSalary,
  
                closed: true,
  
                closedAt:
                  new Date(),
  
              };
  
            }
          )
        );
  
      await Payroll.insertMany(
        payrollData
      );
  
      res.json({
  
        message:
          "Payroll Generated Successfully",
  
      });
  
    } catch (error) {
  
      console.log(error);
  
      res.status(500).json({
  
        message:
          error.message,
  
      });
  
    }
  
  };
  
  exports.getPayrolls =
  async (req, res) => {
  
    try {
  
      const payrolls =
        await Payroll.find()
  
        .populate("labour")
  
        .sort({
          createdAt: -1,
        });
  
      res.json(payrolls);
  
    } catch (error) {
  
      console.log(error);
  
      res.status(500).json({
  
        message:
          error.message,
  
      });
  
    }
  
  };
  
  exports.markAsPaid =
  async (req, res) => {
  
    try {
  
      await Payroll.findByIdAndUpdate(
  
        req.params.id,
  
        {
  
          paymentStatus:
            "Paid",
  
        }
  
      );
  
      res.json({
  
        message:
          "Payment Marked As Paid",
  
      });
  
    } catch (error) {
  
      console.log(error);
  
      res.status(500).json({
  
        message:
          error.message,
  
      });
  
    }
  
  };