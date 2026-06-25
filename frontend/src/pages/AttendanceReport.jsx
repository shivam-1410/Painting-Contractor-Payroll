import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import API from "../services/api";

import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaFilePdf,
  FaFileExcel,
  FaSpinner,
  FaCheckCircle,
  FaClipboardList,
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

  const [exportPDFState, setExportPDFState] = useState("idle");
  const [exportExcelState, setExportExcelState] = useState("idle");

  const handleExportPDF = () => {
    setExportPDFState("loading");
    setTimeout(() => {
      try {
        exportPDF();
        setExportPDFState("success");
      } catch (e) {
        setExportPDFState("idle");
      }
      setTimeout(() => setExportPDFState("idle"), 2000);
    }, 450);
  };

  const handleExportExcel = () => {
    setExportExcelState("loading");
    setTimeout(() => {
      try {
        exportExcel();
        setExportExcelState("success");
      } catch (e) {
        setExportExcelState("idle");
      }
      setTimeout(() => setExportExcelState("idle"), 2000);
    }, 450);
  };

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

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">

              Attendance Reports

            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">

              View, filter, and export detailed monthly labour attendance histories.

            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={handleExportPDF}
              disabled={exportPDFState === "loading"}
              className="bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-80 active:scale-95 flex items-center gap-2 shadow-sm"
            >
              {exportPDFState === "loading" ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Exporting PDF...</span>
                </>
              ) : exportPDFState === "success" ? (
                <>
                  <FaCheckCircle className="animate-bounce scale-110" />
                  <span>Exported!</span>
                </>
              ) : (
                <>
                  <FaFilePdf />
                  <span>Export PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportExcel}
              disabled={exportExcelState === "loading"}
              className="bg-emerald-50 dark:bg-emerald-955/20 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-80 active:scale-95 flex items-center gap-2 shadow-sm"
            >
              {exportExcelState === "loading" ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Exporting Excel...</span>
                </>
              ) : exportExcelState === "success" ? (
                <>
                  <FaCheckCircle className="animate-bounce scale-110" />
                  <span>Exported!</span>
                </>
              ) : (
                <>
                  <FaFileExcel />
                  <span>Export Excel</span>
                </>
              )}
            </button>

          </div>

        </div>

        {/* FILTERS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-4 flex items-center gap-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">

            <FaSearch className="text-slate-400 dark:text-slate-500 text-lg" />

            <input
              type="text"
              placeholder="Search by labourer name or contractor..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />

          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-4 flex items-center gap-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">

            <FaCalendarAlt className="text-indigo-650 dark:text-indigo-400 text-lg" />

            <select
              value={
                selectedMonth
              }
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none text-base text-slate-800 dark:text-slate-100 cursor-pointer"
            >

              <option value="" className="dark:bg-slate-900">
                All Months
              </option>

              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, idx) => (
                <option key={m} value={idx + 1} className="dark:bg-slate-900">{m}</option>
              ))}

            </select>

          </div>

        </div>

        {/* TABLE */}

        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-16 text-center border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
            <FaClipboardList className="text-slate-350 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No attendance records found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try selecting a different labourer, month, or search query.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] border-collapse">

                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">

                  <tr>

                    <th className="px-6 py-4 text-left">
                      Labour
                    </th>

                    <th className="px-6 py-4 text-left">
                      Site
                    </th>

                    <th className="px-6 py-4 text-left">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left">
                      Contractor
                    </th>

                    <th className="px-6 py-4 text-left">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left">
                      Overtime (Hrs)
                    </th>

                    <th className="px-6 py-4 text-left">
                      Tea
                    </th>

                    <th className="px-6 py-4 text-left">
                      Bhada
                    </th>

                    <th className="px-6 py-4 text-left">
                      Advance
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {filteredReports.map(
                    (report, index) => (

                      <tr
                        key={report._id}
                        style={{ "--stagger-delay": `${index * 20}ms` }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150 animate-slide-in-staggered"
                      >

                        <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white font-outfit text-sm">

                          {report?.labour?.name ||
                            report?.labourName ||
                            "Deleted Labour"}

                        </td>

                        <td className="px-6 py-4.5 text-sm font-semibold text-slate-700 dark:text-slate-350">

                          {report.site?.name || "N/A"}

                        </td>

                        <td className="px-6 py-4.5">

                          <span className={
                            report.status === "Present" 
                              ? "badge-present" 
                              : report.status === "Absent" 
                                ? "badge-absent" 
                                : "badge-halfday"
                          }>
                            {report.status}
                          </span>

                        </td>

                        <td className="px-6 py-4.5 text-sm font-semibold text-slate-700 dark:text-slate-350">

                          {report.site?.contractorName || "N/A"}

                        </td>

                        <td className="px-6 py-4.5 text-sm text-slate-500 font-medium">

                          {new Date(
                            report.date
                          ).toLocaleDateString("en-IN")}

                        </td>

                        <td className="px-6 py-4.5">

                          <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">

                            <FaClock className="text-indigo-500 dark:text-indigo-400 text-xs shrink-0" />

                            {report.overtime !== undefined ? report.overtime : (report.nightShift || 0)}

                          </div>

                        </td>

                        <td className="px-6 py-4.5 text-sm text-amber-600 dark:text-amber-450 font-semibold font-outfit">
                          ₹{report.teaExpense || 0}
                        </td>

                        <td className="px-6 py-4.5 text-sm text-amber-600 dark:text-amber-450 font-semibold font-outfit">
                          ₹{report.bhada || 0}
                        </td>

                        <td className="px-6 py-4.5 text-sm text-rose-600 dark:text-rose-450 font-bold font-outfit">
                          ₹{report.advance || 0}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

    </MainLayout>

  );

};

export default AttendanceReport;