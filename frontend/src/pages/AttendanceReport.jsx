import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import API from "../services/api";

import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AttendanceReport = () => {

  const [reports, setReports] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedMonth,
    setSelectedMonth] =
    useState("");

  useEffect(() => {

    fetchReports();

  }, []);

  const fetchReports =
    async () => {

      try {

        const res =
          await API.get(
            "/reports/attendance"
          );

        setReports(
          res.data || []
        );

      } catch (error) {

        console.log(error);

      }

    };

  const filteredReports =
    reports.filter((report) => {

      const labourName =
        report?.labour?.name ||
        report?.labourName ||
        "Deleted Labour";

      const contractorName =
        report.site?.contractorName ||
        "N/A";

      const matchesSearch =
        labourName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        contractorName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const reportMonth =
        new Date(
          report.date
        ).getMonth() + 1;

      const matchesMonth =
        selectedMonth
          ? reportMonth ===
            Number(
              selectedMonth
            )
          : true;

      return (
        matchesSearch &&
        matchesMonth
      );

    });

  const getMonthName = (monthNum) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[Number(monthNum) - 1] || "";
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Attendance Report", 14, 20);

    // Subheader metadata info
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500

    let subtitleParts = [];
    if (search) {
      const matchedLabour = filteredReports.find(
        (r) => r?.labour?.name || r?.labourName
      );
      const fullName = matchedLabour
        ? (matchedLabour.labour?.name || matchedLabour.labourName)
        : search;
      subtitleParts.push(`Labourer: ${fullName}`);
    } else {
      subtitleParts.push("Labourer: All");
    }

    if (selectedMonth) {
      subtitleParts.push(`Month: ${getMonthName(selectedMonth)}`);
    } else {
      subtitleParts.push("Month: All");
    }

    doc.text(subtitleParts.join("  |  "), 14, 28);
    
    // Add date of generation
    const genDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    doc.text(`Generated on: ${genDate}`, 196, 28, { align: "right" });

    autoTable(doc, {
      startY: 34,
      head: [[
        "Labour",
        "Site",
        "Status",
        "Contractor",
        "Date",
        "Overtime (Hrs)",
        "Tea Expense",
        "Bhada",
        "Advance",
      ]],
      body: filteredReports.map((report) => [
        report?.labour?.name || report?.labourName || "Deleted Labour",
        report.site?.name || "N/A",
        report.status,
        report.site?.contractorName || "N/A",
        new Date(report.date).toLocaleDateString("en-IN"),
        report.overtime !== undefined ? report.overtime : (report.nightShift || 0),
        `₹${report.teaExpense || 0}`,
        `₹${report.bhada || 0}`,
        `₹${report.advance || 0}`,
      ]),
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        fontSize: 9,
      },
    });

    doc.save(`attendance-report-${selectedMonth ? getMonthName(selectedMonth).toLowerCase() : "all"}.pdf`);
  };

  const exportExcel =
    () => {

      const worksheet =
        XLSX.utils.json_to_sheet(

          filteredReports.map(
            (report) => ({

              Labour:
                report?.labour?.name ||
                report?.labourName ||
                "Deleted Labour",

              Site:
                report.site?.name || "N/A",

              Status:
                report.status,

              Contractor:
                report.site?.contractorName || "N/A",

              Date:
                new Date(
                  report.date
                ).toLocaleDateString(),

              Overtime:
                report.overtime !== undefined ? report.overtime : (report.nightShift || 0),

              Tea:
                report.teaExpense || 0,

              Bhada:
                report.bhada || 0,

              Advance:
                report.advance || 0,

            })
          )

        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Attendance Report"

      );

      const excelBuffer =
        XLSX.write(
          workbook,
          {
            bookType:
              "xlsx",
            type:
              "array",
          }
        );

      const data =
        new Blob(
          [excelBuffer],
          {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
          }
        );

      saveAs(
        data,
        "attendance-report.xlsx"
      );

    };

  return (

    <MainLayout>

      <div className="w-full">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

          <div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800">

              Attendance Reports

            </h1>

            <p className="text-slate-500 mt-2">

              Complete labour attendance history

            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={exportPDF}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
            >

              <FaFilePdf />

              Export PDF

            </button>

            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
            >

              <FaFileExcel />

              Export Excel

            </button>

          </div>

        </div>

        {/* FILTERS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">

            <FaSearch className="text-slate-400" />

            <input
              type="text"
              placeholder="Search labour..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full outline-none"
            />

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">

            <FaCalendarAlt className="text-blue-900" />

            <select
              value={
                selectedMonth
              }
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value
                )
              }
              className="w-full outline-none bg-transparent"
            >

              <option value="">
                All Months
              </option>

              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>

            </select>

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-3xl shadow-xl overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead className="bg-blue-950 text-white">

              <tr>

                <th className="p-5 text-left">
                  Labour
                </th>

                <th className="p-5 text-left">
                  Site
                </th>

                <th className="p-5 text-left">
                  Status
                </th>

                <th className="p-5 text-left">
                  Contractor
                </th>

                <th className="p-5 text-left">
                  Date
                </th>

                <th className="p-5 text-left">
                  Overtime (Hrs)
                </th>

                <th className="p-5 text-left">
                  Tea
                </th>

                <th className="p-5 text-left">
                  Bhada
                </th>

                <th className="p-5 text-left">
                  Advance
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredReports.map(
                (report) => (

                  <tr
                    key={report._id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-5 font-semibold">

                      {report?.labour?.name ||
                        report?.labourName ||
                        "Deleted Labour"}

                    </td>

                    <td className="p-5 text-slate-600 font-medium">

                      {report.site?.name || "N/A"}

                    </td>

                    <td className="p-5">

                      {report.status}

                    </td>

                    <td className="p-5 font-semibold text-slate-700 dark:text-slate-200">

                      {report.site?.contractorName || "N/A"}

                    </td>

                    <td className="p-5">

                      {new Date(
                        report.date
                      ).toLocaleDateString()}

                    </td>

                    <td className="p-5">

                      <div className="flex items-center gap-2">

                        <FaClock className="text-purple-600" />

                        {report.overtime !== undefined ? report.overtime : (report.nightShift || 0)}

                      </div>

                    </td>

                    <td className="p-5">
                      ₹{report.teaExpense || 0}
                    </td>

                    <td className="p-5">
                      ₹{report.bhada || 0}
                    </td>

                    <td className="p-5">
                      ₹{report.advance || 0}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </MainLayout>

  );

};

export default AttendanceReport;