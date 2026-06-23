const Labour = require("../models/Labour");

const Attendance = require(
  "../models/Attendance"
);

exports.generateReceipt = async (
  req,
  res
) => {

  try {

    const labours =
      await Labour.find();

    const receipts =
      await Promise.all(

        labours.map(
          async (labour) => {

            const attendance =
              await Attendance.find({

                labour:
                  labour._id,

              }).populate("site");

            const presentDays =
              attendance.filter(

                (item) =>
                  item.status ===
                  "Present"

              ).length;

            const halfDays =
              attendance.reduce(

                (total, item) =>

                  total +
                  (item.halfDay || 0),

                0

              );

            const nightShift =
              attendance.reduce(

                (total, item) =>

                  total +
                  (item.nightShift ||
                    0),

                0

              );

            const teaExpense =
              attendance.reduce(

                (total, item) =>

                  total +
                  (item.teaExpense ||
                    0),

                0

              );

            const bhada =
              attendance.reduce(

                (total, item) =>

                  total +
                  (item.bhada || 0),

                0

              );

            const advance =
              attendance.reduce(

                (total, item) =>

                  total +
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

              _id: labour._id,

              labourName:
                labour.name,
              phone:
                labour.phone,

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

              dailyWage:
                labour.dailyWage,

              presentDays,

              halfDays,

              nightShift,

              teaExpense,

              bhada,

              advance,

              totalSalary,

              month:
                new Date().toLocaleString(
                  "default",
                  {
                    month: "long",
                  }
                ),

            };

          }
        )
      );

    res.json(receipts);

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};