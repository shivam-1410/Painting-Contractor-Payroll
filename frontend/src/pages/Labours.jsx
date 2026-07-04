import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Plus,
  Search,
  Phone,
  DollarSign,
  User,
  Trash2,
  Edit,
  Download,
  Building,
  UserCheck,
  MoreVertical,
  Users
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import AddLabourModal from "../components/AddLabourModal";
import EditLabourModal from "../components/EditLabourModal";
import AnimatedCounter from "../components/AnimatedCounter";

const Labours = () => {
  const [labours, setLabours] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLabour, setEditLabour] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetchLabours();
    fetchSites();
  }, []);

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

  const deleteLabour = async (id) => {
    if (!window.confirm("Are you sure you want to delete this labour worker? This will permanently remove their records.")) {
      return;
    }
    try {
      await API.delete(`/labours/${id}`);
      fetchLabours();
    } catch (error) {
      console.log(error);
    }
  };

  const openEditModal = (labour) => {
    setEditLabour(labour);
    setShowEditModal(true);
  };

  const handleExport = () => {
    const dataToExport = filteredLabours.map((l) => ({
      Name: l.name,
      Phone: l.phone || "—",
      "Daily Wage": l.dailyWage,
      "Assigned Site": l.assignedSite?.name || "General / Unassigned",
      Status: l.phone ? "Active" : "On Leave",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labour Directory");
    XLSX.writeFile(wb, "Labour_Directory.xlsx");
  };

  const filteredLabours = labours.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone && l.phone.includes(searchTerm));
      
    // Site filter
    const matchesSite =
      siteFilter === "all" ||
      (l.assignedSite && l.assignedSite._id === siteFilter) ||
      (l.site && l.site === siteFilter);

    return matchesSearch && matchesSite;
  });

  // Unique profile initial backgrounds
  const avatarGradients = [
    "from-blue-600 to-indigo-650",
    "from-emerald-500 to-teal-600",
    "from-indigo-500 to-purple-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600"
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 relative">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Labour Directory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Manage, monitor, and configure all contractor workforce records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="btn-secondary-premium flex items-center justify-center gap-2 text-xs"
              title="Export to Excel"
            >
              <Download className="w-4 h-4" />
              <span>Export Directory</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary-premium flex items-center justify-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Labourer</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-4 transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500">
            <Search className="text-slate-400 dark:text-slate-500 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search labourer by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-455 dark:placeholder-slate-500"
            />
          </div>

          {/* Site Filter dropdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-3">
            <Building className="text-slate-400 dark:text-slate-500 w-4 h-4 shrink-0" />
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-bold text-slate-700 dark:text-slate-300 border-none cursor-pointer"
            >
              <option value="all">All Sites</option>
              {sites.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Workforce count */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-xl border border-indigo-100/30 dark:border-indigo-900/20">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Workforce</span>
            </div>
            <span className="bg-indigo-650 dark:bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-black font-outfit">
              <AnimatedCounter value={filteredLabours.length} formatter={(v) => v} />
            </span>
          </div>
        </div>

        {/* CARDS LIST CONTAINER */}
        {filteredLabours.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm p-16 text-center border border-slate-200/50 dark:border-slate-800/80">
            <Users className="text-slate-350 dark:text-slate-650 w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No workers match criteria</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Try resetting filters or registering a new labourer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabours.map((labour, index) => {
              const gradientClass = avatarGradients[index % avatarGradients.length];
              return (
                <motion.div
                  key={labour._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[20px] p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-750 transition-premium relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-slate-100/40 dark:bg-slate-800/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  {/* Card Header (Avatar + Name + Status) */}
                  <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-850">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-black text-base shadow-sm font-outfit select-none`}>
                      {labour.name ? labour.name.charAt(0) : "L"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate font-outfit leading-tight">
                        {labour.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          Active Status
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="space-y-3.5 mb-6 text-xs text-slate-650 dark:text-slate-350">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-semibold text-slate-400 dark:text-slate-500">Phone</span>
                      </div>
                      <span className="font-extrabold text-slate-850 dark:text-white font-outfit">{labour.phone || "—"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-semibold text-slate-400 dark:text-slate-500">Active Site</span>
                      </div>
                      <span className="font-bold text-indigo-650 dark:text-indigo-400 truncate max-w-[130px]">
                        {labour.assignedSite?.name || labour.site?.name || "General"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-semibold text-slate-400 dark:text-slate-500">Daily Wage</span>
                      </div>
                      <span className="font-black text-slate-850 dark:text-white text-sm font-outfit">
                        {labour.dailyWage}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(labour)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-650 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border border-slate-200/40 dark:border-slate-700/50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteLabour(labour._id)}
                      className="py-2.5 px-3.5 bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center border border-rose-100 dark:border-rose-900/30"
                      title="Delete Labourer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* FLOATING ACTION BUTTON */}
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-indigo-600/30 border border-white/10 z-50 hover:from-indigo-500 hover:to-blue-500"
          title="Add New Labourer"
        >
          <Plus className="w-6 h-6" />
        </motion.button>

      </div>

      {showModal && (
        <AddLabourModal
          closeModal={() => setShowModal(false)}
          fetchLabours={fetchLabours}
        />
      )}

      {showEditModal && (
        <EditLabourModal
          labour={editLabour}
          closeModal={() => setShowEditModal(false)}
          fetchLabours={fetchLabours}
        />
      )}
    </MainLayout>
  );
};

export default Labours;