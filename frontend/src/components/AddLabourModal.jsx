import { useEffect, useState } from "react";
import API from "../services/api";
import { FaTimes, FaUser, FaPhoneAlt, FaMoneyBillWave, FaCalendarAlt } from "react-icons/fa";

const AddLabourModal = ({
  closeModal,
  fetchLabours,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dailyWage: "",
    joiningDate: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveLabour = async () => {
    if (!formData.name.trim()) {
      alert("Labour Name is required");
      return;
    }
    try {
      await API.post("/labours", formData);
      fetchLabours();
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-outfit">Add New Labourer</h2>
              <p className="text-slate-400 mt-1 text-xs font-medium">Create a new labourer record in the workforce database.</p>
            </div>
            <button
              onClick={closeModal}
              className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 text-xs uppercase tracking-wider font-outfit">
              Labour Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500">
                <FaUser className="text-sm" />
              </span>
              <input
                type="text"
                name="name"
                placeholder="Ramesh Kumar"
                value={formData.name}
                onChange={handleChange}
                className="input-premium pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 text-xs uppercase tracking-wider font-outfit">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500">
                <FaPhoneAlt className="text-sm" />
              </span>
              <input
                type="text"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="input-premium pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 text-xs uppercase tracking-wider font-outfit">
              Daily Wage (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                name="dailyWage"
                placeholder="600"
                value={formData.dailyWage}
                onChange={handleChange}
                className="input-premium pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 text-xs uppercase tracking-wider font-outfit">
              Joining Date
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500">
                <FaCalendarAlt className="text-sm" />
              </span>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="input-premium pl-11"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={saveLabour}
              className="flex-1 btn-primary-premium text-sm py-3.5"
            >
              Save Labourer
            </button>
            <button
              onClick={closeModal}
              className="flex-1 btn-secondary-premium text-sm py-3.5"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLabourModal;