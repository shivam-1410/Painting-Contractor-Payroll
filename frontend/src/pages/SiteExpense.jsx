import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Eye,
  DollarSign,
  Building,
  FileText,
  Calendar,
  Store,
  Search,
  Upload,
  AlertCircle,
  FileCheck,
  TrendingUp,
  X,
  PlusCircle,
  MinusCircle,
  ArrowRight
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import { toast } from "react-hot-toast";
import AnimatedCounter from "../components/AnimatedCounter";
import { formatDate } from "../utils/dateFormatter";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const SiteExpense = () => {
  const [challans, setChallans] = useState([]);
  const [sites, setSites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSiteFilter, setSelectedSiteFilter] = useState("all");
  const [dragActive, setDragActive] = useState(false);
  const [mockBillFile, setMockBillFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    site: "",
    challanNo: "",
    vendor: "",
    billDate: new Date().toISOString().split("T")[0],
    items: [{ itemName: "", liter: "", qty: 1, rate: 0, amount: 0 }],
  });

  useEffect(() => {
    fetchChallans();
    fetchSites();
  }, []);

  const fetchChallans = async () => {
    try {
      const res = await API.get("/challans");
      setChallans(res.data);
    } catch (error) {
      console.error("Error fetching challans:", error);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await API.get("/sites");
      setSites(res.data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const handleHeaderChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const item = { ...updatedItems[index] };

    if (field === "qty") {
      item.qty = Number(value) || 0;
      item.amount = item.qty * item.rate;
    } else if (field === "rate") {
      item.rate = Number(value) || 0;
      item.amount = item.qty * item.rate;
    } else if (field === "amount") {
      item.amount = Number(value) || 0;
    } else {
      item[field] = value;
    }

    updatedItems[index] = item;
    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { itemName: "", liter: "", qty: 1, rate: 0, amount: 0 },
      ],
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Grand Total of items in the form
  const formGrandTotal = formData.items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const createChallan = async () => {
    if (!formData.site || !formData.challanNo || !formData.vendor || !formData.billDate) {
      toast.error("Please fill in all header fields (Site, Challan No, Vendor, Date)");
      return;
    }

    const invalidItem = formData.items.find(
      (item) => !item.itemName || !item.qty || item.amount === undefined
    );
    if (invalidItem) {
      toast.error("Please enter Particulars, Qty, and Amount for all item rows.");
      return;
    }

    try {
      await API.post("/challans", formData);
      fetchChallans();
      setShowModal(false);
      setMockBillFile(null);
      toast.success("Challan saved successfully!");

      // Reset Form
      setFormData({
        site: "",
        challanNo: "",
        vendor: "",
        billDate: new Date().toISOString().split("T")[0],
        items: [{ itemName: "", liter: "", qty: 1, rate: 0, amount: 0 }],
      });
    } catch (error) {
      console.error("Error creating challan:", error);
      toast.error(error.response?.data?.message || "Error creating challan record.");
    }
  };

  const deleteChallan = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteChallan = async () => {
    if (!deleteConfirmId) return;
    try {
      await API.delete(`/challans/${deleteConfirmId}`);
      fetchChallans();
      toast.success("Challan deleted successfully!", { icon: "🗑️" });
    } catch (error) {
      console.error("Error deleting challan:", error);
      toast.error("Failed to delete challan.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Drag and drop mock uploader
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setMockBillFile(e.dataTransfer.files[0]);
      toast.success(`Selected file: ${e.dataTransfer.files[0].name}`);
    }
  };

  // KPI Calculations
  const grandTotalExpenses = challans.reduce(
    (sum, c) => sum + (c.totalAmount || 0),
    0
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = challans
    .filter((c) => {
      const date = new Date(c.billDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  // Recharts Monthly Breakdown Data
  const getExpensesByMonth = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const data = months.map((m, index) => {
      const total = challans
        .filter((c) => {
          const date = new Date(c.billDate);
          return date.getMonth() === index && date.getFullYear() === currentYear;
        })
        .reduce((sum, c) => sum + (c.totalAmount || 0), 0);
      return { name: m, amount: total };
    });
    return data.filter(item => item.amount > 0 || months.indexOf(item.name) <= new Date().getMonth());
  };

  const chartData = getExpensesByMonth();

  const filteredChallans = challans.filter((c) => {
    const siteObj = c.site || {};
    const siteName = siteObj.name || "";
    const vendorName = c.vendor || "";
    const challanNo = c.challanNo || "";
    
    const matchesSearch =
      siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challanNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSite =
      selectedSiteFilter === "all" ||
      (c.site && c.site._id === selectedSiteFilter) ||
      (c.site && c.site === selectedSiteFilter);

    return matchesSearch && matchesSite;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Site Expense Challans
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Track paint deliveries, material invoices, and supplier bills across contractor painting projects.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary-premium flex items-center justify-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Challan Expense</span>
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xs relative overflow-hidden border-l-4 border-l-rose-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-outfit">Grand Total Expenses</p>
                <h2 className="text-2xl font-black text-rose-600 dark:text-rose-455 mt-2 font-outfit">
                  <AnimatedCounter value={grandTotalExpenses} />
                </h2>
              </div>
              <div className="bg-rose-50 dark:bg-rose-955/20 p-3 rounded-xl border border-rose-100/30">
                <DollarSign className="w-5 h-5 text-rose-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xs relative overflow-hidden border-l-4 border-l-amber-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-outfit">This Month's Expenses</p>
                <h2 className="text-2xl font-black text-amber-600 dark:text-amber-450 mt-2 font-outfit">
                  <AnimatedCounter value={monthlyExpenses} />
                </h2>
              </div>
              <div className="bg-amber-50 dark:bg-amber-955/20 p-3 rounded-xl border border-amber-100/30">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xs relative overflow-hidden border-l-4 border-l-indigo-650">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-outfit">Total Challan Records</p>
                <h2 className="text-2xl font-black text-[#0B2C6F] dark:text-indigo-400 mt-2 font-outfit">
                  <AnimatedCounter value={challans.length} formatter={(v) => v} />
                </h2>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-955/20 p-3 rounded-xl border border-indigo-105/30">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* TRENDS CHART */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-[24px] shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                Monthly Expenses Trend
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                Challan amount progression
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-450" />
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderRadius: "16px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-4 transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500">
            <Search className="text-slate-400 dark:text-slate-500 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search challan by vendor, number, or site name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-455"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-3">
            <Building className="text-slate-400 dark:text-slate-500 w-4 h-4 shrink-0" />
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer border-none"
            >
              <option value="all">All Project Sites</option>
              {sites.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CARDS LIST CONTAINER */}
        {filteredChallans.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm p-16 text-center border border-slate-200/50 dark:border-slate-800/80">
            <FileText className="text-slate-350 dark:text-slate-650 w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No site expenses logged</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Create a new site expense challan to begin logging records.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallans.map((challan, index) => (
              <motion.div
                key={challan._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-premium relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Header (Challan Number + Date) */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-850 mb-4">
                    <div>
                      <span className="text-[10px] font-black font-outfit bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100/30 px-2 py-0.5 rounded-lg">
                        #{challan.challanNo}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1.5 font-outfit">
                        {challan.vendor}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase font-outfit">
                      {formatDate(challan.billDate)}
                    </span>
                  </div>

                  {/* Site Name & Details */}
                  <div className="space-y-3 mb-6 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">Project Site</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 font-outfit truncate max-w-[150px]">
                        {challan.sites && challan.sites.length > 0
                          ? challan.sites.map((s) => s?.name).join(", ")
                          : challan.site?.name || "General"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">Material Items</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{challan.items?.length || 0} items</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">Grand Total</span>
                      <span className="font-black text-rose-600 dark:text-rose-455 text-sm font-outfit">
                        {(challan.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setSelectedChallan(challan)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-650 hover:text-white text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200/40 dark:border-slate-700/50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Slip</span>
                  </button>
                  <button
                    onClick={() => deleteChallan(challan._id)}
                    className="py-2.5 px-3.5 bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center border border-rose-100 dark:border-rose-900/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MOCK BILL FILE PREVIEW & DETAILS DRAWER */}
        <AnimatePresence>
          {selectedChallan && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in"
              >
                <div className="border-b border-slate-150 dark:border-slate-850 p-6 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                  <div>
                    <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-200/30 px-2 py-0.5 rounded-lg font-outfit uppercase">Challan Invoice Details</span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit mt-1.5">#{selectedChallan.challanNo} ({selectedChallan.vendor})</h2>
                  </div>
                  <button
                    onClick={() => setSelectedChallan(null)}
                    className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-[9px] uppercase tracking-widest text-slate-400">Project Site</span>
                      <span className="text-slate-850 dark:text-white mt-1 block font-bold font-outfit">
                        {selectedChallan.sites && selectedChallan.sites.length > 0
                          ? selectedChallan.sites.map((s) => s?.name).join(", ")
                          : selectedChallan.site?.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-widest text-slate-400">Bill Date</span>
                      <span className="text-slate-850 dark:text-white mt-1 block font-bold font-outfit">{formatDate(selectedChallan.billDate)}</span>
                    </div>
                  </div>

                  <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 border-b border-slate-150 dark:border-slate-850">
                        <tr className="uppercase font-bold tracking-wider font-outfit">
                          <th className="px-4 py-3 text-left">Particulars</th>
                          <th className="px-4 py-3 text-center">Pack (L)</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Rate</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                        {selectedChallan.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-semibold text-slate-850 dark:text-white">{item.itemName}</td>
                            <td className="px-4 py-3 text-center">{item.liter || "—"}</td>
                            <td className="px-4 py-3 text-center font-bold">{item.qty}</td>
                            <td className="px-4 py-3 text-right font-semibold">{item.rate || 0}</td>
                            <td className="px-4 py-3 text-right font-extrabold text-slate-850 dark:text-white font-outfit">
                              {(item.amount || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Total */}
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-150 dark:border-slate-850">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-300 font-outfit uppercase tracking-wider">Grand Total Amount</span>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-455 font-outfit">
                      {(selectedChallan.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ADD CHALLAN MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in">
              <div className="border-b border-slate-150 dark:border-slate-850 p-6 md:p-8 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-outfit">Add Site Expense Challan</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Enter invoice headers and item details</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMockBillFile(null);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6 flex-1">
                {/* HEADERS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Select Site *</label>
                    <select
                      name="site"
                      value={formData.site}
                      onChange={handleHeaderChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    >
                      <option value="">Select Project Site</option>
                      {sites.map((site) => (
                        <option key={site._id} value={site._id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Challan / Bill No *</label>
                    <input
                      type="text"
                      name="challanNo"
                      value={formData.challanNo}
                      onChange={handleHeaderChange}
                      placeholder="e.g. 504"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Vendor / Supplier *</label>
                    <input
                      type="text"
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleHeaderChange}
                      placeholder="e.g. Jalaram Paints"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-855 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Bill Date *</label>
                    <input
                      type="date"
                      name="billDate"
                      value={formData.billDate}
                      onChange={handleHeaderChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    />
                  </div>
                </div>

                {/* ITEMS SECTION */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest font-outfit">Challan Particulars</h3>
                    <button
                      onClick={addItemRow}
                      className="text-xs text-indigo-650 dark:text-indigo-400 font-extrabold flex items-center gap-1.5 hover:underline active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Row
                    </button>
                  </div>

                  <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50/40 dark:bg-slate-950/20">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-xs">
                        <thead className="bg-slate-55/60 dark:bg-slate-950/50 text-slate-500 border-b border-slate-150 dark:border-slate-850">
                          <tr className="uppercase font-bold tracking-wider font-outfit">
                            <th className="px-4 py-3 text-left w-2/5">Particulars *</th>
                            <th className="px-4 py-3 text-center w-1/6">Litres</th>
                            <th className="px-4 py-3 text-center w-1/12">Qty *</th>
                            <th className="px-4 py-3 text-right w-1/6">Rate</th>
                            <th className="px-4 py-3 text-right w-1/6">Amount</th>
                            <th className="px-4 py-3 text-center w-1/12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {formData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2.5">
                                <input
                                  type="text"
                                  placeholder="e.g. Royal Emulsion"
                                  value={item.itemName}
                                  onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-medium"
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  type="text"
                                  placeholder="e.g. 20L"
                                  value={item.liter}
                                  onChange={(e) => handleItemChange(index, "liter", e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-center"
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-center font-bold"
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-right font-semibold"
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-right font-extrabold text-slate-800 dark:text-white"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <button
                                  onClick={() => removeItemRow(index)}
                                  disabled={formData.items.length === 1}
                                  className="text-rose-500 hover:text-rose-600 disabled:opacity-30"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* FILE DRAG & DROP UPLOADER */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upload Challan Slip / Receipt (Mock)</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      dragActive
                        ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10"
                    } ${mockBillFile ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10" : ""}`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2 text-xs">
                      {mockBillFile ? (
                        <>
                          <FileCheck className="w-8 h-8 text-emerald-500 animate-bounce" />
                          <span className="font-extrabold text-slate-800 dark:text-white font-outfit">{mockBillFile.name}</span>
                          <span className="text-[10px] text-slate-400">File attached successfully</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Drag & Drop receipt file here, or click to browse</span>
                          <span className="text-[10px] text-slate-400">Supports PDF, PNG, JPG (Max 5MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* FORM GRAND TOTAL */}
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <span className="text-xs font-black text-slate-850 dark:text-slate-300 font-outfit uppercase tracking-wider">Grand Total</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-455 font-outfit">
                    {formGrandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-150 dark:border-slate-850 p-6 flex justify-end gap-3.5 bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMockBillFile(null);
                  }}
                  className="btn-secondary-premium text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={createChallan}
                  className="btn-primary-premium text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Challan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION DIALOG */}
        <AnimatePresence>
          {deleteConfirmId && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center animate-scale-in"
              >
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white font-outfit uppercase tracking-wider">Delete Challan Record?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium">
                  This action is irreversible and will permanently delete this challan invoice from database.
                </p>
                <div className="flex gap-3.5 mt-6 justify-center">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="btn-secondary-premium text-xs flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteChallan}
                    className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex-1"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </MainLayout>
  );
};

export default SiteExpense;