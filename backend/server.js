const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const labourRoutes = require("./routes/labourRoutes");
const attendanceRoutes = require(
  "./routes/attendanceRoutes"
);
const salaryRoutes = require("./routes/salaryRoutes");
const dashboardRoutes= require("./routes/dashboardRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const cors = require("cors");
const siteRoutes =require("./routes/SiteRoutes");
const transferRoutes =require("./routes/transferroutes");
const payrollRoutes =
require("./routes/PayrollRoutes");
const reportRoutes =
require("./routes/reportRoutes");


dotenv.config();

console.log("Starting server...");

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log("MongoDB Connected Successfully");
    app.use(express.json());
    app.use("/public",express.static("public"));
    app.use(cors());
    app.use("/api/labours", labourRoutes);
    app.use("/api/salary", salaryRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/receipt", receiptRoutes);
    app.use("/api/sites", siteRoutes);
    app.use(
      "/api/transfers",
      transferRoutes
    );
    app.use(
      "/api/attendance",
      attendanceRoutes
    );
    app.use(
      "/api/payroll",
      payrollRoutes
    );
   
    

    app.get("/", (req, res) => {
      res.send("Backend Running 🚀");
    });

    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    app.use(
      "/api/reports",
      reportRoutes
    );
    
   
     

  })
  .catch((err) => {

    console.log("MongoDB Connection Failed");

    console.log(err);
  });