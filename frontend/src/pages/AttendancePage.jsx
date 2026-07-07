import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Search,
  Clock,
  Coffee,
  Truck,
  DollarSign,
  Briefcase,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileCheck
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import toast from "react-hot-toast";

const Attendance = () => {
  const [labours, setLabours] = useState([]);
  const [search, setSearch] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState({});
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [sites, setSites] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    fetchLabours();
    fetchSites();
  }, []);

  useEffect(() => {
    setAttendanceData({});
    fetchAttendanceByDate();
  }, [attendanceDate]);

  const fetchLabours = async () => {
    try {
      const res = await API.get("/labours");
      setLabours(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await API.get("/sites");
      setSites(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAttendanceByDate = async () => {
    try {
      const res = await API.get("/attendance");
      setAllAttendance(res.data);
      const filtered = res.data.filter((item) => {
        if (!item.date) return false;
        const itemDate = new Date(item.date).toISOString().split("T")[0];
        return itemDate === attendanceDate;
      });
      setExistingAttendance(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (labourId, field, value) => {
    setAttendanceData({
      ...attendanceData,
      [labourId]: {
        ...attendanceData[labourId],
        [field]: value,
      },
    });
  };

  const getLabourPayload = (labourId) => {
    const data = attendanceData[labourId] || {};
    const existing = existingAttendance.find(
      (item) => item.labour?._id?.toString() === labourId.toString()
    );

    const finalStatus = data.status || existing?.status || "Present";
    const selectedSiteId =
      data.site !== undefined
        ? data.site
        : existing?.site?._id || existing?.site || (() => {
            const lastAtt = allAttendance.find(
              (item) =>
                (item.labour?._id || item.labour)?.toString() === labourId.toString() &&
                item.site
            );
            return lastAtt?.site?._id || lastAtt?.site || "";
          })();

    return {
      labour: labourId,
      status: finalStatus,
      date: attendanceDate,
      halfDay: finalStatus === "Half Day" ? 1 : 0,
      overtime:
        data.overtime !== undefined
          ? Number(data.overtime)
          : (existing?.hasOwnProperty("overtime")
            ? existing.overtime
            : (existing?.nightShift || 0)),
      teaExpense:
        data.teaExpense !== undefined
          ? Number(data.teaExpense)
          : (existing?.teaExpense || 0),
      bhada:
        data.bhada !== undefined
          ? Number(data.bhada)
          : (existing?.bhada || 0),
      advance:
        data.advance !== undefined
          ? Number(data.advance)
          : (existing?.advance || 0),
      site: selectedSiteId || undefined,
    };
  };

  const saveSingle = async (labourId) => {
    try {
      const payload = getLabourPayload(labourId);
      await API.post("/attendance", payload);
      toast.success(`Attendance updated for ${labours.find(l => l._id === labourId)?.name}`);
      fetchAttendanceByDate();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save record");
    }
  };

  const saveBulk = async () => {
    setBulkSaving(true);
    const loadingToast = toast.loading("Saving all workforce logs...");
    try {
      await Promise.all(
        filteredLabours.map((labour) => {
          const payload = getLabourPayload(labour._id);
          return API.post("/attendance", payload);
        })
      );
      toast.success("All attendance records saved successfully!", { id: loadingToast });
      fetchAttendanceByDate();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save some attendance records", { id: loadingToast });
    } finally {
      setBulkSaving(false);
    }
  };

  const filteredLabours = labours.filter((labour) => {
    const matchesLabourName = labour.name.toLowerCase().includes(search.toLowerCase());

    const existing = existingAttendance.find(
      (item) => item.labour?._id?.toString() === labour._id.toString()
    );

    const selectedSiteId =
      attendanceData[labour._id]?.site !== undefined
        ? attendanceData[labour._id].site
        : existing?.site?._id || existing?.site || (() => {
            const lastAtt = allAttendance.find(
              (item) =>
                (item.labour?._id || item.labour)?.toString() === labour._id.toString() &&
                item.site
            );
            return lastAtt?.site?._id || lastAtt?.site || "";
          })();

    const selectedSiteObj = sites.find(s => (s._id || s).toString() === selectedSiteId?.toString());
    const contractorName = selectedSiteObj?.contractorName || "";
    const matchesContractorName = contractorName.toLowerCase().includes(search.toLowerCase());

    return matchesLabourName || matchesContractorName;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Daily stats calculation for progress bars
  const totalCount = filteredLabours.length;
  const presentCount = filteredLabours.filter(l => {
    const existing = existingAttendance.find(item => item.labour?._id?.toString() === l._id.toString());
    return (attendanceData[l._id]?.status || existing?.status || "Present") === "Present";
  }).length;
  const halfCount = filteredLabours.filter(l => {
    const existing = existingAttendance.find(item => item.labour?._id?.toString() === l._id.toString());
    return (attendanceData[l._id]?.status || existing?.status) === "Half Day";
  }).length;
  const absentCount = filteredLabours.filter(l => {
    const existing = existingAttendance.find(item => item.labour?._id?.toString() === l._id.toString());
    return (attendanceData[l._id]?.status || existing?.status) === "Absent";
  }).length;

  const getDayName = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const dayName = getDayName(attendanceDate);
  const isSunday = dayName === "Sunday";

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Attendance Board
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Track check-ins, overtime, tea allowance, and advance payouts for each labourer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Weekday Badge */}
            {dayName && (
              <div
                className={`px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider font-outfit shadow-xs transition-all duration-300 ${
                  isSunday
                    ? "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 text-rose-650 dark:text-rose-400 font-extrabold"
                    : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 text-slate-800 dark:text-slate-100"
                }`}
              >
                {dayName}
              </div>
            )}

            {/* Calendar Date Picker */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs px-4 py-2.5 flex items-center gap-3 transition-all duration-300">
              <Calendar className="text-indigo-650 dark:text-indigo-400 w-4 h-4" />
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-transparent outline-none text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
              />
            </div>

            {/* Bulk Save Button */}
            <button
              onClick={saveBulk}
              disabled={bulkSaving || filteredLabours.length === 0}
              className="btn-primary-premium flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:pointer-events-none"
            >
              <Save className="w-4 h-4" />
              <span>Bulk Save All</span>
            </button>
          </div>
        </div>

        {/* ATTENDANCE ANALYTICS PROGRESS BARS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-[24px] shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
          <ProgressBarStat
            label="Present"
            count={presentCount}
            total={totalCount}
            color="bg-emerald-500"
            textColor="text-emerald-700 dark:text-emerald-400"
            bgColor="bg-emerald-500/10"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          />
          <ProgressBarStat
            label="Half Day"
            count={halfCount}
            total={totalCount}
            color="bg-amber-500"
            textColor="text-amber-700 dark:text-amber-400"
            bgColor="bg-amber-500/10"
            icon={<HelpCircle className="w-4 h-4 text-amber-500" />}
          />
          <ProgressBarStat
            label="Absent"
            count={absentCount}
            total={totalCount}
            color="bg-rose-500"
            textColor="text-rose-700 dark:text-rose-455"
            bgColor="bg-rose-500/10"
            icon={<XCircle className="w-4 h-4 text-rose-500" />}
          />
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-4 transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500">
          <Search className="text-slate-400 dark:text-slate-500 w-5 h-5 shrink-0" />
          <input
            type="text"
            placeholder="Search by labourer name or contractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-455 dark:placeholder-slate-500"
          />
        </div>

        {/* CARDS LIST CONTAINER */}
        {filteredLabours.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm p-16 text-center border border-slate-200/50 dark:border-slate-800/80">
            <FileCheck className="text-slate-350 dark:text-slate-650 w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No workers matching criteria</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Verify your search criteria or register new labourers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabours.map((labour, index) => {
              const existing = existingAttendance.find(
                (item) => item.labour?._id?.toString() === labour._id.toString()
              );

              const selectedSiteId =
                attendanceData[labour._id]?.site !== undefined
                  ? attendanceData[labour._id].site
                  : existing?.site?._id || existing?.site || (() => {
                      const lastAtt = allAttendance.find(
                        (item) =>
                          (item.labour?._id || item.labour)?.toString() === labour._id.toString() &&
                          item.site
                      );
                      return lastAtt?.site?._id || lastAtt?.site || "";
                    })();

              const selectedSiteObj = sites.find(s => (s._id || s).toString() === selectedSiteId?.toString());
              const contractorName = selectedSiteObj?.contractorName || "N/A";
              const currentStatus =
                attendanceData[labour._id]?.status !== undefined
                  ? attendanceData[labour._id].status
                  : existing?.status || "Present";

              const overtimeVal =
                attendanceData[labour._id]?.overtime !== undefined
                  ? attendanceData[labour._id].overtime
                  : (existing?.hasOwnProperty("overtime")
                    ? existing.overtime
                    : (existing?.nightShift || 0));

              const teaVal =
                attendanceData[labour._id]?.teaExpense !== undefined
                  ? attendanceData[labour._id].teaExpense
                  : (existing?.teaExpense || 0);

              const bhadaVal =
                attendanceData[labour._id]?.bhada !== undefined
                  ? attendanceData[labour._id].bhada
                  : (existing?.bhada || 0);

              const advanceVal =
                attendanceData[labour._id]?.advance !== undefined
                  ? attendanceData[labour._id].advance
                  : (existing?.advance || 0);

              return (
                <motion.div
                  key={labour._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-premium relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Name + Contractor info */}
                    <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-850">
                      <div>
                        <h3 className="text-xs font-black text-slate-800 dark:text-white font-outfit uppercase tracking-wider">
                          {labour.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-450" /> {contractorName || "No Contractor"}
                        </p>
                      </div>
                      <span className="text-[10px] font-black font-outfit text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/30 px-2 py-0.5 rounded-lg">
                        {labour.dailyWage}/day
                      </span>
                    </div>

                    {/* Site Selection */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Assigned Painting Site</label>
                      <select
                        value={selectedSiteId}
                        onChange={(e) => handleChange(labour._id, "site", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 w-full text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                      >
                        <option value="">Select Site</option>
                        {sites.map((site) => (
                          <option key={site._id} value={site._id}>
                            {site.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Check-In Buttons */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Check-in Status</label>
                      <div className="flex gap-1 bg-slate-100/80 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850 w-full">
                        {["Present", "Absent", "Half Day"].map((statusOption) => {
                          const isSelected = currentStatus === statusOption;
                          let activeClass = "";
                          if (isSelected) {
                            if (statusOption === "Present") activeClass = "bg-emerald-500 text-white shadow-sm";
                            else if (statusOption === "Absent") activeClass = "bg-rose-500 text-white shadow-sm";
                            else activeClass = "bg-amber-500 text-white shadow-sm";
                          } else {
                            activeClass = "text-slate-400 dark:text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-250";
                          }
                          return (
                            <button
                              key={statusOption}
                              onClick={() => handleChange(labour._id, "status", statusOption)}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 ${activeClass}`}
                            >
                              {statusOption}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Check-In Fields (OT, Tea, Bhada, Advance) */}
                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      <CardField
                        label="Overtime (Hrs)"
                        value={overtimeVal}
                        icon={<Clock className="w-3 h-3 text-indigo-500" />}
                        onChange={(val) => handleChange(labour._id, "overtime", val)}
                      />
                      <CardField
                        label="Tea Expense"
                        value={teaVal}
                        icon={<Coffee className="w-3 h-3 text-amber-500" />}
                        onChange={(val) => handleChange(labour._id, "teaExpense", val)}
                      />
                      <CardField
                        label="Bhada (Travel)"
                        value={bhadaVal}
                        icon={<Truck className="w-3 h-3 text-blue-500" />}
                        onChange={(val) => handleChange(labour._id, "bhada", val)}
                      />
                      <CardField
                        label="Advance Paid"
                        value={advanceVal}
                        icon={<DollarSign className="w-3 h-3 text-rose-500" />}
                        onChange={(val) => handleChange(labour._id, "advance", val)}
                        textColor="text-rose-600 dark:text-rose-455 font-bold"
                      />
                    </div>
                  </div>

                  {/* Save button per card */}
                  <button
                    onClick={() => saveSingle(labour._id)}
                    className={`w-full font-bold py-2.5 rounded-xl shadow-xs text-xs transition-all duration-200 active:scale-[0.96] hover:scale-[1.01] text-white mt-5 flex items-center justify-center gap-1.5 ${
                      existing
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
                        : "bg-indigo-650 hover:bg-indigo-700 shadow-indigo-600/10"
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{existing ? "Update Logs" : "Save Log"}</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

const ProgressBarStat = ({ label, count, total, color, textColor, bgColor, icon }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-2 p-1.5">
      <div className="flex items-center justify-between text-xs font-bold font-outfit uppercase tracking-wider">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        <span className={textColor}>{count} / {total} ({percent}%)</span>
      </div>
      <div className={`w-full h-3 rounded-full ${bgColor} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

const CardField = ({ label, value, icon, onChange, textColor = "text-slate-800 dark:text-slate-100 font-medium" }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/25">
        {icon}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-transparent outline-none text-xs w-full text-right ${textColor}`}
        />
      </div>
    </div>
  );
};

export default Attendance;