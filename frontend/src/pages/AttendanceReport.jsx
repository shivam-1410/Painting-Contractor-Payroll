import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Search,
  Calendar,
  Download,
  Trash2,
  FileCheck,
  CheckCircle,
  HelpCircle,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import { formatDate } from "../utils/dateFormatter";
import AnimatedCounter from "../components/AnimatedCounter";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const AttendanceReport = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
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

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports/attendance");
      setReports(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await API.delete(`/attendance/${id}`);
        fetchReports();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const filteredReports = reports.filter((report) => {
    const labourName = report?.labour?.name || report?.labourName || "Deleted Labour";
    const contractorName = report.site?.contractorName || "N/A";
    const matchesSearch =
      labourName.toLowerCase().includes(search.toLowerCase()) ||
      contractorName.toLowerCase().includes(search.toLowerCase()) ||
      (report.site?.name && report.site.name.toLowerCase().includes(search.toLowerCase()));

    const reportMonth = new Date(report.date).getMonth() + 1;
    const matchesMonth = selectedMonth ? reportMonth === Number(selectedMonth) : true;

    return matchesSearch && matchesMonth;
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateB - dateA;
    const nameA = (a.labour?.name || a.labourName || "Deleted Labour").toLowerCase();
    const nameB = (b.labour?.name || b.labourName || "Deleted Labour").toLowerCase();
    return nameA.localeCompare(nameB);
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
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("Attendance Report", 14, 20);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);

    let subtitleParts = [];
    if (search) {
      const matchedLabour = filteredReports.find(r => r?.labour?.name || r?.labourName);
      const fullName = matchedLabour ? (matchedLabour.labour?.name || matchedLabour.labourName) : search;
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
    
    const genDate = formatDate(new Date());
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
        formatDate(report.date),
        report.overtime !== undefined ? report.overtime : (report.nightShift || 0),
        report.teaExpense || 0,
        report.bhada || 0,
        report.advance || 0,
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

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredReports.map((report) => ({
        Labour: report?.labour?.name || report?.labourName || "Deleted Labour",
        Site: report.site?.name || "N/A",
        Status: report.status,
        Contractor: report.site?.contractorName || "N/A",
        Date: formatDate(report.date),
        Overtime: report.overtime !== undefined ? report.overtime : (report.nightShift || 0),
        Tea: report.teaExpense || 0,
        Bhada: report.bhada || 0,
        Advance: report.advance || 0,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "attendance-report.xlsx");
  };

  // KPI calculations
  const totalLogs = filteredReports.length;
  const presentLogs = filteredReports.filter(r => r.status === "Present").length;
  const halfLogs = filteredReports.filter(r => r.status === "Half Day").length;
  const absentLogs = filteredReports.filter(r => r.status === "Absent").length;
  const totalOt = filteredReports.reduce((sum, r) => sum + (r.overtime || r.nightShift || 0), 0);

  // Group attendance statuses for Chart
  const getChartData = () => {
    const data = {};
    filteredReports.forEach((r) => {
      const dateStr = formatDate(r.date);
      if (!data[dateStr]) {
        data[dateStr] = { date: dateStr, Present: 0, Absent: 0, HalfDay: 0 };
      }
      if (r.status === "Present") data[dateStr].Present++;
      else if (r.status === "Absent") data[dateStr].Absent++;
      else if (r.status === "Half Day") data[dateStr].HalfDay++;
    });
    return Object.values(data).slice(0, 7).reverse(); // top 7 dates
  };

  const chartData = getChartData();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Attendance Records Auditing
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Audit attendance checklists, filter records, and export reports for salary calculations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="btn-secondary-premium flex items-center justify-center gap-2 text-xs"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="btn-primary-premium flex items-center justify-center gap-2 text-xs"
              title="Download Excel"
            >
              <FileCheck className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatMiniCard
            title="Total Logs"
            value={totalLogs}
            icon={<FileCheck className="w-4 h-4 text-indigo-650" />}
            color="border-l-4 border-indigo-650"
          />
          <StatMiniCard
            title="Presents"
            value={presentLogs}
            icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
            color="border-l-4 border-emerald-500"
          />
          <StatMiniCard
            title="Half Days"
            value={halfLogs}
            icon={<HelpCircle className="w-4 h-4 text-amber-500" />}
            color="border-l-4 border-amber-500"
          />
          <StatMiniCard
            title="OT Accumulated (Hrs)"
            value={totalOt}
            icon={<Clock className="w-4 h-4 text-blue-500" />}
            color="border-l-4 border-blue-500"
          />
        </div>

        {/* CHART SECTION */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-[24px] shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                  Check-in Ratios Over Time
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Daily attendance distribution (Last 7 active days)
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-slate-450" />
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Present" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="HalfDay" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SEARCH & MONTH FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-4 transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500">
            <Search className="text-slate-400 dark:text-slate-500 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search by worker name, site, or contractor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-455"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-3">
            <Calendar className="text-slate-400 dark:text-slate-500 w-4 h-4 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer border-none"
            >
              <option value="">All Months</option>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((num) => (
                <option key={num} value={num}>{getMonthName(num)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DATA SHEET TABLE */}
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm p-16 text-center border border-slate-200/50 dark:border-slate-800/80">
            <FileCheck className="text-slate-350 dark:text-slate-650 w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No logs matching filters</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Verify your search criteria or reset date filters.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">
                    <th className="px-5 py-4 text-left font-semibold">Labour Name</th>
                    <th className="px-5 py-4 text-left font-semibold">Project Site</th>
                    <th className="px-5 py-4 text-left font-semibold">Check-in Status</th>
                    <th className="px-5 py-4 text-left font-semibold">Contractor</th>
                    <th className="px-5 py-4 text-left font-semibold">Log Date</th>
                    <th className="px-5 py-4 text-right font-semibold">OT (Hrs)</th>
                    <th className="px-5 py-4 text-right font-semibold">Tea</th>
                    <th className="px-5 py-4 text-right font-semibold">Bhada</th>
                    <th className="px-5 py-4 text-right font-semibold">Advance</th>
                    <th className="px-5 py-4 text-center font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredReports.map((report, index) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12, delay: index * 0.015 }}
                      key={report._id}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white font-outfit text-xs">
                        {report.labour?.name || report.labourName || "Deleted Labour"}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
                        {report.site?.name || "N/A"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={
                          report.status === "Present"
                            ? "badge-present text-[10px]"
                            : report.status === "Absent"
                              ? "badge-absent text-[10px]"
                              : "badge-halfday text-[10px]"
                        }>
                          {report.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
                        {report.site?.contractorName || "N/A"}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
                        {formatDate(report.date)}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-bold text-right text-slate-800 dark:text-slate-200">
                        {report.overtime !== undefined ? report.overtime : (report.nightShift || 0)}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-semibold text-right text-slate-850 dark:text-slate-200">
                        {report.teaExpense || 0}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-semibold text-right text-slate-850 dark:text-slate-200">
                        {report.bhada || 0}
                      </td>

                      <td className="px-5 py-3.5 text-xs font-extrabold text-right text-rose-600 dark:text-rose-455 font-outfit">
                        {report.advance || 0}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="text-rose-500 hover:text-rose-600 dark:text-rose-400 p-2 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded-xl transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

const StatMiniCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-4.5 rounded-[20px] shadow-xs relative overflow-hidden transition-premium hover:-translate-y-0.5 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-outfit">{title}</p>
          <h3 className="text-lg font-black text-slate-850 dark:text-white mt-1 font-outfit">
            <AnimatedCounter value={value} formatter={(v) => v} />
          </h3>
        </div>
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/60 shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;