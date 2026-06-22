require("dotenv").config();

const mongoose =
require("mongoose");

const Attendance =
require("./models/Attendance");

async function migrate() {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "Mongo Connected"
    );

    const records =
      await Attendance.find();

    let updated = 0;

    for (const record of records) {

      let changed = false;

      if (
        record.labourId &&
        !record.labour
      ) {

        record.labour =
          record.labourId;

        changed = true;

      }

      if (
        record.advancePaid !==
          undefined &&
        record.advance ===
          undefined
      ) {

        record.advance =
          record.advancePaid;

        changed = true;

      }

      if (
        record.travelExpense !==
          undefined &&
        record.bhada ===
          undefined
      ) {

        record.bhada =
          record.travelExpense;

        changed = true;

      }

      if (changed) {

        await record.save();

        updated++;

      }

    }

    console.log(
      `Updated ${updated} records`
    );

    process.exit();

  } catch (error) {

    console.log(error);

    process.exit(1);

  }

}

migrate();