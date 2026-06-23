const Attendance = require(
    "../models/Attendance"
  );
  
  const Payroll = require(
    "../models/Payroll"
  );
  
  exports.getAttendanceReport =
  async (req, res) => {
  
    try {
  
      const attendance =
        await Attendance.find()
  
        .populate("labour")

        .populate("site")
  
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
  
  exports.getPaymentReport =
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