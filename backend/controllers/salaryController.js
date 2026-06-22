const Labour = require("../models/Labour");

const Attendance = require(
  "../models/Attendance"
);

exports.getSalaryData = async (
  req,
  res
) => {

  try {

    const labours =
      await Labour.find();

    const salaryData =
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

            const nightShift =
              attendance.reduce(

                (sum, item) =>

                  sum +
                  (item.nightShift ||
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

            const nightBonus =
              nightShift * 150;

            const totalSalary =

              baseSalary +

              halfSalary +

              nightBonus -

              teaExpense -

              bhada -

              advance;

            return {

              labourId:
                labour._id,

              labourName:
                labour.name,

              presentDays,

              halfDays,

              nightShift,

              teaExpense,

              bhada,

              advance,

              totalSalary,

            };

          }
        )
      );

    res.json(salaryData);

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};