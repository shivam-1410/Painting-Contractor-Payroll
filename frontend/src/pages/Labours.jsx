import MainLayout from "../layouts/MainLayout";
import { FaPlus, FaUsers, FaSearch, FaPhoneAlt, FaTrashAlt, FaEdit, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchLabours();
  }, []);

  const fetchLabours = async () => {
    try {
      const res = await API.get("/labours");
      setLabours(res.data);
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

  const filteredLabours = labours.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone && l.phone.includes(searchTerm))
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">
              Labour Directory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
              Manage, monitor, and configure all contractor workforce records.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary-premium flex items-center justify-center gap-2"
          >
            <FaPlus className="text-xs" />
            <span>Add Labourer</span>
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-4 flex items-center gap-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
            <FaSearch className="text-slate-400 dark:text-slate-500 text-lg shrink-0" />
            <input
              type="text"
              placeholder="Search labourer by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-base text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-4 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl">
                <FaUsers className="text-lg" />
              </div>
              <span className="text-sm font-semibold text-slate-650 dark:text-slate-300">Total Workforce</span>
            </div>
            <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-bold font-outfit">
              <AnimatedCounter value={filteredLabours.length} formatter={(v) => v} />
            </span>
          </div>
        </div>

        {/* Table Container */}
        {filteredLabours.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-16 text-center border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
            <FaUsers className="text-slate-350 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No labour workers found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try searching for another name/phone, or add new labour.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider font-outfit">
                    <th className="text-left px-6 py-4">Labour Name</th>
                    <th className="text-left px-6 py-4">Phone Number</th>
                    <th className="text-left px-6 py-4">Daily Wage</th>
                    <th className="text-right px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLabours.map((labour, index) => (
                    <tr
                      key={labour._id}
                      style={{ "--stagger-delay": `${index * 20}ms` }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150 animate-slide-in-staggered"
                    >
                      <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white font-outfit text-sm">
                        {labour.name}
                      </td>

                      <td className="px-6 py-4.5 text-slate-600 dark:text-slate-350 text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <FaPhoneAlt className="text-slate-400 dark:text-slate-500 text-xs shrink-0" />
                          {labour.phone || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4.5 text-sm">
                        <span className="badge-present">
                          ₹<AnimatedCounter value={labour.dailyWage} />/day
                        </span>
                      </td>

                      <td className="px-6 py-4.5 text-right">
                        <div className="flex gap-2.5 justify-end">
                          <button
                            onClick={() => openEditModal(labour)}
                            className="bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-sm"
                          >
                            <FaEdit className="text-xs" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => deleteLabour(labour._id)}
                            className="bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-sm"
                          >
                            <FaTrashAlt className="text-xs" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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