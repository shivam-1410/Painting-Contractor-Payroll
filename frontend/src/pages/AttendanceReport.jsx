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
  TrendingUp,
  Users,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import { formatDate } from "../utils/dateFormatter";
import AnimatedCounter from "../components/AnimatedCounter";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

/* ─────────────────────────────────────────── */
/*  Custom Tooltip for Bar Chart               */
/* ─────────────────────────────────────────── */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-4 py-3 shadow-2xl min-w-[140px]">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full block" style={{ background: entry.fill }} />
            <span className="text-[10px] font-semibold text-slate-300">{entry.name}</span>
          </div>
          <span className="text-[11px] font-black text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────── */
/*  Custom Donut centre label                  */
/* ─────────────────────────────────────────── */
const DonutLabel = ({ cx, cy, total }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" className="fill-slate-800 dark:fill-white font-black" style={{ fontSize: 22, fontFamily: "Outfit, sans-serif", fontWeight: 800 }}>
      {total}
    </text>
    <text x={cx} y={cy + 12} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 600, fill: "#94a3b8" }}>
      Total Logs
    </text>
  </>
);

/* ─────────────────────────────────────────── */
/*  Main Component                             */
/* ─────────────────────────────────────────── */
const AttendanceReport = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [exportPDFState, setExportPDFState] = useState("idle");
  const [exportExcelState, setExportExcelState] = useState("idle");

  const handleExportPDF = () => {
    setExportPDFState("loading");
    setTimeout(() => {
      try { exportPDF(); setExportPDFState("success"); }
      catch { setExportPDFState("idle"); }
      setTimeout(() => setExportPDFState("idle"), 2000);
    }, 450);
  };

  const handleExportExcel = () => {
    setExportExcelState("loading");
    setTimeout(() => {
      try { exportExcel(); setExportExcelState("success"); }
      catch { setExportExcelState("idle"); }
      setTimeout(() => setExportExcelState("idle"), 2000);
    }, 450);
  };

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports/attendance");
      setReports(res.data || []);
    } catch (error) { console.log(error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this attendance record?")) {
      try { await API.delete(`/attendance/${id}`); fetchReports(); }
      catch (error) { console.log(error); }
    }
  };

  const getMonthName = (monthNum) => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return months[Number(monthNum) - 1] || "";
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
    const nameA = (a.labour?.name || a.labourName || "").toLowerCase();
    const nameB = (b.labour?.name || b.labourName || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  /* ── KPI ── */
  const totalLogs    = filteredReports.length;
  const presentLogs  = filteredReports.filter(r => r.status === "Present").length;
  const halfLogs     = filteredReports.filter(r => r.status === "Half Day").length;
  const absentLogs   = filteredReports.filter(r => r.status === "Absent").length;
  const totalOt      = filteredReports.reduce((s, r) => s + (r.overtime || r.nightShift || 0), 0);

  /* ── Donut data ── */
  const donutData = [
    { name: "Present",  value: presentLogs, color: "#10b981" },
    { name: "Half Day", value: halfLogs,    color: "#f59e0b" },
    { name: "Absent",   value: absentLogs,  color: "#f43f5e" },
  ].filter(d => d.value > 0);

  /* ── Bar chart data (last 7 active days) ── */
  const getChartData = () => {
    const data = {};
    filteredReports.forEach((r) => {
      const raw = new Date(r.date);
      const dateStr = `${String(raw.getUTCDate()).padStart(2,"0")}/${String(raw.getUTCMonth()+1).padStart(2,"0")}`;
      if (!data[dateStr]) data[dateStr] = { date: dateStr, Present: 0, Absent: 0, "Half Day": 0 };
      if (r.status === "Present")       data[dateStr].Present++;
      else if (r.status === "Absent")   data[dateStr].Absent++;
      else if (r.status === "Half Day") data[dateStr]["Half Day"]++;
    });
    return Object.values(data).slice(-7);
  };
  const chartData = getChartData();

  /* ── PDF / Excel exports ── */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Helvetica","bold"); doc.setFontSize(22); doc.setTextColor(15,23,42);
    doc.text("Attendance Report", 14, 20);
    doc.setFont("Helvetica","normal"); doc.setFontSize(10); doc.setTextColor(100,116,139);
    const subtitle = `${search ? `Labour: ${search}` : "Labour: All"}  |  Month: ${selectedMonth ? getMonthName(selectedMonth) : "All"}`;
    doc.text(subtitle, 14, 28);
    doc.text(`Generated: ${formatDate(new Date())}`, 196, 28, { align: "right" });
    autoTable(doc, {
      startY: 34,
      head: [["Labour","Site","Status","Contractor","Date","OT (Hrs)","Tea","Bhada","Advance"]],
      body: filteredReports.map(r => [
        r?.labour?.name || r?.labourName || "Deleted",
        r.site?.name || "N/A", r.status,
        r.site?.contractorName || "N/A",
        formatDate(r.date),
        r.overtime !== undefined ? r.overtime : (r.nightShift || 0),
        r.teaExpense || 0, r.bhada || 0, r.advance || 0,
      ]),
      headStyles: { fillColor: [15,23,42], textColor: [255,255,255], fontSize: 9, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248,250,252] },
      styles: { fontSize: 9 },
    });
    doc.save(`attendance-report-${selectedMonth ? getMonthName(selectedMonth).toLowerCase() : "all"}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredReports.map(r => ({
      Labour: r?.labour?.name || r?.labourName || "Deleted",
      Site: r.site?.name || "N/A", Status: r.status,
      Contractor: r.site?.contractorName || "N/A",
      Date: formatDate(r.date),
      Overtime: r.overtime !== undefined ? r.overtime : (r.nightShift || 0),
      Tea: r.teaExpense || 0, Bhada: r.bhada || 0, Advance: r.advance || 0,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "attendance-report.xlsx");
  };

  /* ── Render ── */
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Attendance Records
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Audit attendance logs, filter records, and export reports for salary calculations.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={handleExportPDF}
              className="btn-secondary-premium flex items-center gap-2 text-xs">
              <Download className="w-4 h-4" />
              {exportPDFState === "loading" ? "Exporting…" : exportPDFState === "success" ? "✓ Done" : "PDF"}
            </button>
            <button onClick={handleExportExcel}
              className="btn-primary-premium flex items-center gap-2 text-xs">
              <FileCheck className="w-4 h-4" />
              {exportExcelState === "loading" ? "Exporting…" : exportExcelState === "success" ? "✓ Done" : "Excel"}
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Logs"    value={totalLogs}   accent="#6366f1" icon={<Users className="w-4 h-4" />} />
          <StatCard title="Present"       value={presentLogs} accent="#10b981" icon={<CheckCircle className="w-4 h-4" />} />
          <StatCard title="Half Days"     value={halfLogs}    accent="#f59e0b" icon={<HelpCircle className="w-4 h-4" />} />
          <StatCard title="OT Hours"      value={totalOt}     accent="#3b82f6" icon={<Clock className="w-4 h-4" />} />
        </div>

        {/* ── CHARTS ROW ── */}
        {totalLogs > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Donut — Attendance Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                  Status Breakdown
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">Overall distribution</p>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-full" style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                        </filter>
                      </defs>
                      <Pie
                        data={donutData}
                        cx="50%" cy="50%"
                        innerRadius={58} outerRadius={82}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                        filter="url(#shadow)"
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                        <DonutLabel cx={0} cy={0} total={totalLogs} />
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-lg">
                              <span className="font-bold">{payload[0].name}:</span> {payload[0].value}
                            </div>
                          ) : null
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend pills */}
                <div className="flex flex-wrap justify-center gap-2 w-full">
                  {[
                    { label: "Present",  value: presentLogs, color: "#10b981" },
                    { label: "Half Day", value: halfLogs,    color: "#f59e0b" },
                    { label: "Absent",   value: absentLogs,  color: "#f43f5e" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 rounded-full px-3 py-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white ml-0.5">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grouped Bar — Daily Attendance */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                    Daily Check-in Trend
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">Last 7 active days</p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                    <defs>
                      <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                      </linearGradient>
                      <linearGradient id="gradHalf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                      </linearGradient>
                      <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8", fontFamily: "Inter" }}
                      tickLine={false} axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8", fontFamily: "Inter" }}
                      tickLine={false} axisLine={false}
                      width={28}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)", radius: 8 }} />
                    <Bar dataKey="Present"  fill="url(#gradPresent)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Half Day" fill="url(#gradHalf)"    radius={[6, 6, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Absent"   fill="url(#gradAbsent)"  radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No data for selected filters
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 justify-center">
                {[
                  { label: "Present",  color: "#10b981" },
                  { label: "Half Day", color: "#f59e0b" },
                  { label: "Absent",   color: "#f43f5e" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── FILTERS ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <Search className="text-slate-400 w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search by worker, site or contractor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs px-4 py-3 flex items-center gap-3 min-w-[180px]">
            <Calendar className="text-slate-400 w-4 h-4 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="">All Months</option>
              {["1","2","3","4","5","6","7","8","9","10","11","12"].map(n => (
                <option key={n} value={n}>{getMonthName(n)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── TABLE / EMPTY ── */}
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm p-16 text-center border border-slate-200/50 dark:border-slate-800/80">
            <FileCheck className="text-slate-300 dark:text-slate-700 w-14 h-14 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No matching records</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">Adjust your search or month filter.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] shadow-sm overflow-hidden">
            {/* Table summary strip */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Showing <span className="text-slate-800 dark:text-white">{filteredReports.length}</span> records
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {presentLogs} Present
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  {halfLogs} Half
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                  {absentLogs} Absent
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800 text-[10px] tracking-widest uppercase font-bold text-slate-400 dark:text-slate-500 font-outfit">
                    <th className="px-6 py-4 text-left">Labour Name</th>
                    <th className="px-6 py-4 text-left">Site</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Contractor</th>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-right">OT Hrs</th>
                    <th className="px-6 py-4 text-right">Tea</th>
                    <th className="px-6 py-4 text-right">Bhada</th>
                    <th className="px-6 py-4 text-right">Advance</th>
                    <th className="px-6 py-4 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {filteredReports.map((report, index) => {
                    const name = report.labour?.name || report.labourName || "Deleted Labour";
                    const initials = name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
                    const hues = [210, 160, 280, 340, 30, 190];
                    const hue = hues[(name.charCodeAt(0) || 0) % hues.length];

                    return (
                      <motion.tr
                        key={report._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.12, delay: Math.min(index * 0.01, 0.3) }}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group"
                      >
                        {/* Labour Name with avatar */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0"
                              style={{ background: `hsl(${hue}, 70%, 52%)` }}
                            >
                              {initials}
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white font-outfit whitespace-nowrap">{name}</span>
                          </div>
                        </td>

                        <td className="px-6 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {report.site?.name || "N/A"}
                        </td>

                        <td className="px-6 py-3.5">
                          <StatusBadge status={report.status} />
                        </td>

                        <td className="px-6 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {report.site?.contractorName || "N/A"}
                        </td>

                        <td className="px-6 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(report.date)}
                        </td>

                        <td className="px-6 py-3.5 text-right">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                            {report.overtime !== undefined ? report.overtime : (report.nightShift || 0)}h
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {report.teaExpense || 0}
                        </td>

                        <td className="px-6 py-3.5 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {report.bhada || 0}
                        </td>

                        <td className="px-6 py-3.5 text-right">
                          <span className={`text-xs font-black ${report.advance ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`}>
                            {report.advance || 0}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

/* ── Sub-components ── */

const StatusBadge = ({ status }) => {
  const map = {
    Present:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200/60 dark:border-emerald-800/50", dot: "bg-emerald-500" },
    Absent:   { bg: "bg-rose-50 dark:bg-rose-950/30",      text: "text-rose-700 dark:text-rose-400",       border: "border-rose-200/60 dark:border-rose-800/50",       dot: "bg-rose-500"    },
    "Half Day": { bg: "bg-amber-50 dark:bg-amber-950/30",  text: "text-amber-700 dark:text-amber-400",     border: "border-amber-200/60 dark:border-amber-800/50",     dot: "bg-amber-500"   },
  };
  const s = map[status] || map.Absent;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const StatCard = ({ title, value, accent, icon }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[20px] p-5 shadow-xs relative overflow-hidden hover:-translate-y-0.5 transition-all duration-200">
    <div
      className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[20px]"
      style={{ background: accent }}
    />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-outfit">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-outfit leading-none">
          <AnimatedCounter value={value} formatter={(v) => v} />
        </h3>
      </div>
      <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
        style={{ color: accent }}>
        {icon}
      </div>
    </div>
  </div>
);

export default AttendanceReport;