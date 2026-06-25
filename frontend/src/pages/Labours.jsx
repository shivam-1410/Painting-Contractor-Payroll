import MainLayout from "../layouts/MainLayout";
import { FaPlus, FaUsers } from "react-icons/fa";
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

  const [searchTerm, setSearchTerm] = useState("");

  const filteredLabours = labours.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone && l.phone.includes(searchTerm))
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight font-outfit">
              Labour Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Manage, monitor, and configure all contractor workforce records.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg hover:shadow-blue-900/20 hover:scale-[1.02] transition-all duration-300 font-semibold"
          >
            <FaPlus className="text-sm" />
            Add Labourer
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="w-full sm:max-w-md relative">
            <input
              type="text"
              placeholder="Search labourer by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-5 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-4 py-2.5 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-sm font-semibold self-start sm:self-auto">
            <span>Total Workforce:</span>
            <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
              <AnimatedCounter value={filteredLabours.length} formatter={(v) => v} />
            </span>
          </div>
        </div>

        {/* Table Container */}
        {filteredLabours.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-16 text-center border border-slate-100 dark:border-slate-700/50 animate-fade-in">
            <FaUsers className="text-slate-300 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No labour workers found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try searching for another name/phone, or add new labour.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="text-left px-6 py-4 font-bold">Labour Name</th>
                    <th className="text-left px-6 py-4 font-bold">Phone Number</th>
                    <th className="text-left px-6 py-4 font-bold">Daily Wage</th>
                    <th className="text-right px-6 py-4 font-bold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredLabours.map((labour, index) => (
                    <tr
                      key={labour._id}
                      style={{ "--stagger-delay": `${index * 25}ms` }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-all duration-150 animate-slide-in-staggered"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {labour.name}
                      </td>

                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {labour.phone || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50 font-outfit">
                          ₹<AnimatedCounter value={labour.dailyWage} />/day
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(labour)}
                            className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border border-blue-100 dark:border-blue-800/50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteLabour(labour._id)}
                            className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border border-rose-100 dark:border-rose-800/50"
                          >
                            Delete
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