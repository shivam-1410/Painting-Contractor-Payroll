const Payroll = require(
    "../models/Payroll"
  );
  
  const Labour = require(
    "../models/Labour"
  );
  
  const Attendance = require(
    "../models/Attendance"
  );
  
  const Site = require(
    "../models/Site"
  );
  
  exports.generatePayroll =
  async (req, res) => {
  
    try {
  
      const { month, year } =
        req.body;
  
      const labours =
        await Labour.find();
  
      const payrollData =
        await Promise.all(
  
          labours.map(
            async (labour) => {
  
              const monthMap = {
                "january": 0, "february": 1, "march": 2, "april": 3,
                "may": 4, "june": 5, "july": 6, "august": 7,
                "september": 8, "october": 9, "november": 10, "december": 11
              };
              const targetMonth = monthMap[month.toLowerCase().trim()];

              const allAttendance = await Attendance.find({
                labour: labour._id,
              }).populate("site");

              const attendance = allAttendance.filter((item) => {
                if (!item.date) return false;
                const d = new Date(item.date);
                return d.getUTCMonth() === targetMonth && d.getUTCFullYear() === Number(year);
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
  
              const overtimeWage = overtime * (labour.dailyWage / 8);
  
              const totalSalary =
  
                 baseSalary +
  
                 halfSalary +
  
                 overtimeWage +
  
                 teaExpense +
  
                 bhada -
  
                 advance;
  
              return {
  
                labour:
                  labour._id,
  
                labourName:
                  labour.name,
  
                phone:
                  labour.phone,
  
                dailyWage:
                  labour.dailyWage,
  
                siteName:
                  (() => {
                    const uniqueSites = [
                      ...new Set(
                        attendance
                          .map((item) => item.site?.name)
                          .filter(Boolean)
                      ),
                    ];
                    return uniqueSites.length > 0 ? uniqueSites.join(", ") : "N/A";
                  })(),
  
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
  
      await Promise.all(
        payrollData.map((data) =>
          Payroll.findOneAndUpdate(
            { labour: data.labour, month: data.month, year: data.year },
            data,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          )
        )
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