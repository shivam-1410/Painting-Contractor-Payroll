import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-hot-toast";
import AnimatedCounter from "../components/AnimatedCounter";
import {
  FaPlus,
  FaTrash,
  FaEye,
  FaMoneyBillWave,
  FaBuilding,
  FaFileInvoice,
  FaCalendarAlt,
  FaStore,
  FaExclamationTriangle,
} from "react-icons/fa";

const SiteExpense = () => {
  const [challans, setChallans] = useState([]);
  const [sites, setSites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
    // Basic validation
    if (!formData.site || !formData.challanNo || !formData.vendor || !formData.billDate) {
      toast.error("Please fill in all header fields (Site, Challan No, Vendor, Date)", {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      });
      return;
    }

    const invalidItem = formData.items.find(
      (item) => !item.itemName || !item.qty || item.amount === undefined
    );
    if (invalidItem) {
      toast.error("Please enter Particulars, Qty, and Amount for all item rows.", {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      });
      return;
    }

    try {
      await API.post("/challans", formData);
      fetchChallans();
      setShowModal(false);
      
      toast.success("Challan saved successfully!", {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      });

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
      toast.error(error.response?.data?.message || "Error creating challan record.", {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      });
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
      toast.success("Challan deleted successfully!", {
        icon: "🗑️",
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      });
    } catch (error) {
      console.error("Error deleting challan:", error);
      toast.error("Failed to delete challan.", {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      });
    } finally {
      setDeleteConfirmId(null);
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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">
              Site Expenses <span className="text-indigo-650 dark:text-indigo-400 font-medium text-xl">(Challans)</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
              Manage material purchases, paint deliveries, and vendor invoices per site.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary-premium flex items-center justify-center gap-2 text-sm"
          >
            <FaPlus className="text-xs" /> Add Challan Expense
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-sm relative overflow-hidden border-t-4 border-t-rose-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">Grand Total Expenses</p>
                <h2 className="text-3xl font-black text-rose-600 dark:text-rose-455 mt-2 font-outfit">
                  ₹<AnimatedCounter value={grandTotalExpenses} />
                </h2>
              </div>
              <div className="bg-rose-50 dark:bg-rose-955/20 p-3.5 rounded-2xl">
                <FaMoneyBillWave className="text-rose-500 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-sm relative overflow-hidden border-t-4 border-t-amber-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">This Month's Expenses</p>
                <h2 className="text-3xl font-black text-amber-600 dark:text-amber-450 mt-2 font-outfit">
                  ₹<AnimatedCounter value={monthlyExpenses} />
                </h2>
              </div>
              <div className="bg-amber-50 dark:bg-amber-955/20 p-3.5 rounded-2xl">
                <FaCalendarAlt className="text-amber-500 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 shadow-sm relative overflow-hidden border-t-4 border-t-indigo-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">Total Challan Records</p>
                <h2 className="text-3xl font-bold text-slate-850 dark:text-slate-200 mt-2 font-outfit">
                  <AnimatedCounter value={challans.length} formatter={(v) => v} />
                </h2>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-955/20 p-3.5 rounded-2xl">
                <FaFileInvoice className="text-indigo-600 dark:text-indigo-400 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* CHALLAN LIST TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">All Challan Receipts</h3>
          </div>
          
          {challans.length === 0 ? (
            <div className="p-20 text-center">
              <FaFileInvoice className="text-slate-350 dark:text-slate-655 text-6xl mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-705 dark:text-slate-300 font-outfit">No challan records found</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Click the button above to log your first site expense.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">
                  <tr>
                    <th className="px-6 py-4 text-left">Bill Date</th>
                    <th className="px-6 py-4 text-left">Challan No.</th>
                    <th className="px-6 py-4 text-left">Site Name</th>
                    <th className="px-6 py-4 text-left">Vendor Name</th>
                    <th className="px-6 py-4 text-right">Items Count</th>
                    <th className="px-6 py-4 text-right">Grand Total</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {challans.map((challan, index) => (
                    <tr
                      key={challan._id}
                      style={{ "--stagger-delay": `${index * 20}ms` }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150 animate-slide-in-staggered"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {new Date(challan.billDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-indigo-650 dark:text-indigo-400">
                        #{challan.challanNo}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100 font-outfit">
                        {challan.sites && challan.sites.length > 0
                           ? challan.sites.map((s) => s?.name || "N/A").join(", ")
                           : challan.site?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {challan.vendor}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-slate-600 dark:text-slate-300">
                        {challan.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-white font-outfit text-base">
                        ₹<AnimatedCounter value={challan.totalAmount || 0} />
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedChallan(challan)}
                          className="text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-900/40 p-2.5 rounded-xl transition-all"
                          title="View Slip Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => deleteChallan(challan._id)}
                          className="text-rose-600 hover:text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:text-rose-400 dark:hover:bg-rose-900/40 p-2.5 rounded-xl transition-all"
                          title="Delete Challan"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ADD CHALLAN MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in">
              <div className="border-b border-slate-150 dark:border-slate-800 p-6 md:p-8 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-outfit">Add Site Expense Challan</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Enter invoice headers and item details</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 w-10 h-10 rounded-full text-xl flex items-center justify-center transition-colors font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6 flex-1">
                {/* HEADERS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Select Site *</label>
                    <select
                      name="site"
                      value={formData.site}
                      onChange={handleHeaderChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all duration-200"
                    >
                      <option value="">-- Choose Site --</option>
                      {sites.map((site) => (
                        <option key={site._id} value={site._id}>
                          {site.name} ({site.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Challan No. *</label>
                    <input
                      type="text"
                      name="challanNo"
                      placeholder="e.g. 2021"
                      value={formData.challanNo}
                      onChange={handleHeaderChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-bold transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Vendor Name *</label>
                    <input
                      type="text"
                      name="vendor"
                      placeholder="e.g. Arihant Buildware"
                      value={formData.vendor}
                      onChange={handleHeaderChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Bill Date *</label>
                    <input
                      type="date"
                      name="billDate"
                      value={formData.billDate}
                      onChange={handleHeaderChange}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="border border-slate-200/60 dark:border-slate-850 rounded-2xl overflow-hidden mt-6">
                  <div className="bg-slate-50 dark:bg-slate-950 px-5 py-4 border-b border-slate-200/60 dark:border-slate-850 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit">Challan Items</span>
                    <button
                      onClick={addItemRow}
                      className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <FaPlus className="text-2xs" /> Add Item Row
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                      <thead className="bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase text-left">
                        <tr>
                          <th className="px-4 py-3 w-[40%]">Particulars / Item Name *</th>
                          <th className="px-4 py-3 w-[15%]">Litre</th>
                          <th className="px-4 py-3 w-[12%] text-right">Qty *</th>
                          <th className="px-4 py-3 w-[15%] text-right">Rate</th>
                          <th className="px-4 py-3 w-[18%] text-right">Amount *</th>
                          <th className="px-4 py-3 w-[8%] text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {formData.items.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/20">
                            <td className="p-2.5">
                              <input
                                type="text"
                                placeholder="e.g. Cement Primer"
                                value={item.itemName}
                                onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-800 dark:text-slate-200"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                placeholder="e.g. 10 Ltr"
                                value={item.liter}
                                onChange={(e) => handleItemChange(index, "liter", e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-700 dark:text-slate-300"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="1"
                                placeholder="1"
                                value={item.qty}
                                onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 px-3 py-2 rounded-xl text-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-800 dark:text-slate-200"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                placeholder="Rate"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 px-3 py-2 rounded-xl text-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-700 dark:text-slate-300"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                placeholder="Amount"
                                value={item.amount}
                                onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 px-3 py-2 rounded-xl text-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-800 dark:text-slate-100"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => removeItemRow(index)}
                                disabled={formData.items.length === 1}
                                className="text-rose-500 hover:text-rose-600 disabled:opacity-30 p-2"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-955 p-5 border-t border-slate-200/60 dark:border-slate-850 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-755 dark:text-slate-300">Grand Total Amount</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white font-outfit">
                      ₹{formGrandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* MODAL FOOTER ACTIONS */}
                <div className="flex gap-3 pt-6 justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-2xl font-semibold transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createChallan}
                    className="bg-indigo-600 hover:bg-indigo-755 text-white px-6 py-3 rounded-2xl font-bold transition-all text-sm"
                  >
                    Save Challan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW CHALLAN DETAIL MODAL (INVOICE SLIP RENDERING) */}
        {selectedChallan && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in">
              <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-200/60 dark:border-slate-850 flex justify-between items-center">
                <div className="flex items-center gap-3 text-indigo-950 dark:text-white">
                  <FaFileInvoice className="text-2xl text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-base font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 font-outfit">Challan Summary</h2>
                </div>
                <button
                  onClick={() => setSelectedChallan(null)}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 w-8 h-8 rounded-full text-xl flex items-center justify-center transition-colors font-bold"
                >
                  ×
                </button>
              </div>

              {/* CHALLAN SLIP CONTENT */}
              <div className="p-6 md:p-8 space-y-6 flex-1 text-slate-700 dark:text-slate-300">
                {/* RETAILER AND CHALLAN GENERAL META */}
                <div className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 font-outfit">
                      <FaStore className="text-indigo-600 dark:text-indigo-400" /> {selectedChallan.vendor}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">Supplier / Vendor</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-555 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Challan No.:</p>
                    <p className="text-lg font-black text-indigo-650 dark:text-indigo-400 font-outfit">#{selectedChallan.challanNo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Associated Sites</p>
                    <h4 className="font-bold text-slate-805 dark:text-slate-200 mt-1 text-sm font-outfit">
                      {selectedChallan.sites && selectedChallan.sites.length > 0
                        ? selectedChallan.sites.map((s) => s?.name || "N/A").join(", ")
                        : selectedChallan.site?.name || "N/A"}
                    </h4>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                      {selectedChallan.sites && selectedChallan.sites.length > 0
                        ? selectedChallan.sites.map((s) => s?.location).filter(Boolean).join(", ")
                        : selectedChallan.site?.location || ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Challan Date</p>
                    <h4 className="font-bold text-slate-805 dark:text-slate-200 mt-1 text-sm font-outfit">
                      {new Date(selectedChallan.billDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h4>
                  </div>
                </div>

                {/* ITEMIZATION TABLE */}
                <div className="mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold text-left">
                        <th className="pb-2 w-[45%] font-bold">PARTICULARS</th>
                        <th className="pb-2 w-[15%] text-center font-bold">LTR.</th>
                        <th className="pb-2 w-[10%] text-center font-bold">QTY.</th>
                        <th className="pb-2 w-[15%] text-right font-bold">RATE</th>
                        <th className="pb-2 w-[15%] text-right font-bold">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium">
                      {selectedChallan.items?.map((item, idx) => (
                        <tr key={idx} className="text-slate-600 dark:text-slate-400 text-sm">
                          <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{item.itemName}</td>
                          <td className="py-3 text-center text-slate-500">{item.liter || "-"}</td>
                          <td className="py-3 text-center">{item.qty}</td>
                          <td className="py-3 text-right">₹{(item.rate || 0).toLocaleString("en-IN")}</td>
                          <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-205">
                            ₹{(item.amount || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 dark:border-slate-800 font-bold">
                        <td colSpan="3" className="py-4"></td>
                        <td className="py-4 font-bold text-slate-500 dark:text-slate-400 text-right">TOTAL AMOUNT:</td>
                        <td className="py-4 font-black text-lg text-slate-900 dark:text-white text-right font-outfit">
                          ₹{(selectedChallan.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* SLIP DECORATION */}
                <div className="border-t border-dashed border-slate-255 dark:border-slate-800 pt-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                  <p>Computer made shade cannot be returned.</p>
                  <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">Thank You</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-850 flex justify-end">
                <button
                  onClick={() => setSelectedChallan(null)}
                  className="bg-indigo-600 hover:bg-indigo-755 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM ANIMATED DELETE CONFIRMATION MODAL */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center animate-scale-in">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 mb-4 animate-bounce">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-outfit">
                Delete Challan
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed font-semibold">
                Are you sure you want to delete this challan? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteChallan}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-bold transition-all text-xs shadow-lg shadow-rose-600/10 hover:shadow-rose-600/20"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SiteExpense;