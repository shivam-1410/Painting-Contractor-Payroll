const Attendance = require(
  "../models/Attendance"
);

const Labour = require(
  "../models/Labour"
);

exports.markAttendance =
async (req, res) => {

  try {

    const labour =
      req.body.labour;

    const selectedDate =
      new Date(req.body.date);

    // NORMALIZE DATE

    selectedDate.setHours(
      0,
      0,
      0,
      0
    );

    // CHECK EXISTING ATTENDANCE

    const existingAttendance =
      await Attendance.findOne({

        labour,

        date: selectedDate,

      });

    // UPDATE EXISTING

    if (existingAttendance) {

      existingAttendance.status =
        req.body.status;

      existingAttendance.halfDay =
        req.body.halfDay;

      existingAttendance.nightShift =
        req.body.nightShift;

      existingAttendance.teaExpense =
        req.body.teaExpense;

      existingAttendance.bhada =
        req.body.bhada;

      existingAttendance.advance =
        req.body.advance;

      await existingAttendance.save();

      return res.json({

        message:
          "Attendance Updated Successfully",

      });

    }

    // CREATE NEW ATTENDANCE

    const labourData =
      await Labour.findById(
        labour
      );

    await Attendance.create({

      labour,

      labourName:
        labourData.name,

      status:
        req.body.status,

      date: selectedDate,

      halfDay:
        req.body.halfDay,

      nightShift:
        req.body.nightShift,

      teaExpense:
        req.body.teaExpense,

      bhada:
        req.body.bhada,

      advance:
        req.body.advance,

    });

    res.status(201).json({

      message:
        "Attendance Saved Successfully",

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};

exports.getAttendance =
async (req, res) => {

  try {

    const attendance =
      await Attendance.find()

      .populate("labour")

      .sort({ date: -1 });

    res.json(attendance);

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};