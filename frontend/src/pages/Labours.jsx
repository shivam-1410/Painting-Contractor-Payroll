import MainLayout from "../layouts/MainLayout";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from "../services/api";
import AddLabourModal from "../components/AddLabourModal";
import EditLabourModal from "../components/EditLabourModal";

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
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight font-outfit">
              Labour Management
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
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
              className="w-full pl-5 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2.5 rounded-2xl border border-blue-100 text-sm font-semibold self-start sm:self-auto">
            <span>Total Workforce:</span>
            <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
              {filteredLabours.length}
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="text-left px-6 py-4 font-bold">Labour Name</th>
                  <th className="text-left px-6 py-4 font-bold">Phone Number</th>
                  <th className="text-left px-6 py-4 font-bold">Daily Wage</th>
                  <th className="text-right px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLabours.length > 0 ? (
                  filteredLabours.map((labour) => (
                    <tr
                      key={labour._id}
                      className="hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                        {labour.name}
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                        {labour.phone || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 font-outfit">
                          ₹{labour.dailyWage.toLocaleString("en-IN")}/day
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(labour)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border border-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteLabour(labour._id)}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border border-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No labour workers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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