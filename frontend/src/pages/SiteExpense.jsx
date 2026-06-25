import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  FaPlus,
  FaTrash,
  FaEye,
  FaMoneyBillWave,
  FaBuilding,
  FaFileInvoice,
  FaCalendarAlt,
  FaStore,
} from "react-icons/fa";

const SiteExpense = () => {
  const [challans, setChallans] = useState([]);
  const [sites, setSites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState(null);

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
      alert("Please fill in all header fields (Site, Challan No, Vendor, Date)");
      return;
    }

    const invalidItem = formData.items.find(
      (item) => !item.itemName || !item.qty || item.amount === undefined
    );
    if (invalidItem) {
      alert("Please enter Particulars, Qty, and Amount for all item rows.");
      return;
    }

    try {
      await API.post("/challans", formData);
      fetchChallans();
      setShowModal(false);
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
      alert(error.response?.data?.message || "Error creating challan record.");
    }
  };

  const deleteChallan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challan?")) return;
    try {
      await API.delete(`/challans/${id}`);
      fetchChallans();
    } catch (error) {
      console.error("Error deleting challan:", error);
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
      <div className="min-h-screen pb-12">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">
              Site Expenses <span className="text-blue-900 font-medium text-3xl">(Challans)</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Manage material purchases, paint deliveries, and vendor invoices per site
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 transition-all transform hover:scale-105 duration-300 font-semibold"
          >
            <FaPlus className="text-sm" /> Add Challan Expense
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-500 font-medium">Grand Total Expenses</p>
                <h2 className="text-4xl font-black text-red-600 mt-3">
                  ₹{grandTotalExpenses.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl">
                <FaMoneyBillWave className="text-red-500 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-500 font-medium">This Month's Expenses</p>
                <h2 className="text-4xl font-black text-orange-600 mt-3">
                  ₹{monthlyExpenses.toLocaleString("en-IN")}
                </h2>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl">
                <FaCalendarAlt className="text-orange-500 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-500 font-medium">Total Challan Records</p>
                <h2 className="text-4xl font-black text-blue-900 mt-3">
                  {challans.length}
                </h2>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl">
                <FaFileInvoice className="text-blue-900 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* CHALLAN LIST TABLE */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-6 bg-slate-550 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">All Challan Receipts</h3>
          </div>
          {challans.length === 0 ? (
            <div className="p-20 text-center">
              <FaFileInvoice className="text-slate-300 text-7xl mx-auto mb-4" />
              <p className="text-slate-500 text-xl font-medium">No challan records found.</p>
              <p className="text-slate-400 mt-1">Click the button above to log your first site expense.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-blue-950 text-white text-left">
                <tr>
                  <th className="p-5 font-semibold">Bill Date</th>
                  <th className="p-5 font-semibold">Challan No.</th>
                  <th className="p-5 font-semibold">Site Name</th>
                  <th className="p-5 font-semibold">Vendor Name</th>
                  <th className="p-5 font-semibold text-right">Items Count</th>
                  <th className="p-5 font-semibold text-right">Grand Total</th>
                  <th className="p-5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challans.map((challan) => (
                  <tr key={challan._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-medium text-slate-700">
                      {new Date(challan.billDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-5 font-semibold text-blue-900">
                      #{challan.challanNo}
                    </td>
                    <td className="p-5 font-bold text-slate-800">
                       {challan.sites && challan.sites.length > 0
                         ? challan.sites.map((s) => s?.name || "N/A").join(", ")
                         : challan.site?.name || "N/A"}
                     </td>
                    <td className="p-5 text-slate-600 font-medium">
                      {challan.vendor}
                    </td>
                    <td className="p-5 text-right font-medium text-slate-600">
                      {challan.items?.length || 0}
                    </td>
                    <td className="p-5 text-right font-extrabold text-slate-900">
                      ₹{(challan.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-5 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedChallan(challan)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 p-3 rounded-xl transition-colors"
                        title="View Slip Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => deleteChallan(challan._id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-xl transition-colors"
                        title="Delete Challan"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ADD CHALLAN MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="bg-gradient-to-r from-blue-950 to-slate-900 p-8 text-white rounded-t-3xl flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">Add Site Expense Challan</h2>
                  <p className="text-slate-300 mt-1">Enter invoice headers and item details</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full text-2xl flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-8 space-y-6 flex-1">
                {/* HEADERS ROW */}
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-2">Select Site *</label>
                    <select
                      name="site"
                      value={formData.site}
                      onChange={handleHeaderChange}
                      className="w-full border border-slate-200 p-4 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all font-medium"
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
                    <label className="block text-slate-500 font-semibold mb-2">Challan No. *</label>
                    <input
                      type="text"
                      name="challanNo"
                      placeholder="e.g. 2021"
                      value={formData.challanNo}
                      onChange={handleHeaderChange}
                      className="w-full border border-slate-200 p-4 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-2">Vendor Name *</label>
                    <input
                      type="text"
                      name="vendor"
                      placeholder="e.g. ARIHANT BUILDS WARE"
                      value={formData.vendor}
                      onChange={handleHeaderChange}
                      className="w-full border border-slate-200 p-4 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-2">Bill Date *</label>
                    <input
                      type="date"
                      name="billDate"
                      value={formData.billDate}
                      onChange={handleHeaderChange}
                      className="w-full border border-slate-200 p-4 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="border border-slate-100 rounded-3xl overflow-hidden mt-8">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Challan Items</span>
                    <button
                      onClick={addItemRow}
                      className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      <FaPlus className="text-xs" /> Add Item Row
                    </button>
                  </div>
                  <table className="w-full">
                    <thead className="bg-slate-100 text-slate-600 text-left text-sm font-bold">
                      <tr>
                        <th className="p-4 w-[40%]">Particulars / Item Name *</th>
                        <th className="p-4 w-[15%]">Litre</th>
                        <th className="p-4 w-[12%] text-right">Qty *</th>
                        <th className="p-4 w-[15%] text-right">Rate</th>
                        <th className="p-4 w-[18%] text-right">Amount *</th>
                        <th className="p-4 w-[8%] text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="e.g. Cement Primer"
                              value={item.itemName}
                              onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                              className="w-full border border-slate-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition-all font-semibold"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="e.g. 10 Ltr"
                              value={item.liter}
                              onChange={(e) => handleItemChange(index, "liter", e.target.value)}
                              className="w-full border border-slate-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="1"
                              placeholder="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                              className="w-full border border-slate-200 px-3 py-2 rounded-xl text-right focus:ring-2 focus:ring-blue-900 outline-none transition-all font-semibold"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              placeholder="Rate"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                              className="w-full border border-slate-200 px-3 py-2 rounded-xl text-right focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              placeholder="Amount"
                              value={item.amount}
                              onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                              className="w-full border border-slate-200 px-3 py-2 rounded-xl text-right focus:ring-2 focus:ring-blue-900 outline-none transition-all font-bold text-slate-800"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => removeItemRow(index)}
                              disabled={formData.items.length === 1}
                              className="text-red-500 hover:text-red-700 disabled:opacity-30 p-2"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-slate-50 p-5 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-700">Grand Total Amount</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{formGrandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* MODAL FOOTER ACTIONS */}
                <div className="flex gap-4 pt-6 justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-8 py-3 rounded-2xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createChallan}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-2xl font-bold transition-all transform hover:scale-105"
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
              <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3 text-blue-950">
                  <FaFileInvoice className="text-3xl" />
                  <h2 className="text-2xl font-black uppercase tracking-wider">Challan Summary</h2>
                </div>
                <button
                  onClick={() => setSelectedChallan(null)}
                  className="bg-slate-200 hover:bg-slate-300 w-10 h-10 rounded-full text-2xl flex items-center justify-center transition-colors font-bold"
                >
                  ×
                </button>
              </div>

              {/* CHALLAN SLIP CONTENT */}
              <div className="p-8 space-y-8 flex-1">
                {/* RETAILER AND CHALLAN GENERAL META */}
                <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <FaStore className="text-blue-900" /> {selectedChallan.vendor}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Supplier / Vendor</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 font-semibold">Challan No.:</p>
                    <p className="text-lg font-black text-blue-900">#{selectedChallan.challanNo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Associated Sites</p>
                    <h4 className="text-lg font-bold text-slate-800 mt-1">
                      {selectedChallan.sites && selectedChallan.sites.length > 0
                        ? selectedChallan.sites.map((s) => s?.name || "N/A").join(", ")
                        : selectedChallan.site?.name || "N/A"}
                    </h4>
                    <p className="text-slate-500 text-sm">
                      {selectedChallan.sites && selectedChallan.sites.length > 0
                        ? selectedChallan.sites.map((s) => s?.location).filter(Boolean).join(", ")
                        : selectedChallan.site?.location || ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Challan Date</p>
                    <h4 className="text-lg font-bold text-slate-800 mt-1">
                      {new Date(selectedChallan.billDate).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h4>
                  </div>
                </div>

                {/* ITEMIZATION TABLE */}
                <div className="mt-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200 text-slate-400 text-sm font-bold text-left">
                        <th className="pb-3 w-[45%]">PARTICULARS</th>
                        <th className="pb-3 w-[15%] text-center">LTR.</th>
                        <th className="pb-3 w-[10%] text-center">QTY.</th>
                        <th className="pb-3 w-[15%] text-right">RATE</th>
                        <th className="pb-3 w-[15%] text-right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedChallan.items?.map((item, idx) => (
                        <tr key={idx} className="text-slate-700 font-medium">
                          <td className="py-4 font-bold text-slate-800">{item.itemName}</td>
                          <td className="py-4 text-center text-slate-500">{item.liter || "-"}</td>
                          <td className="py-4 text-center">{item.qty}</td>
                          <td className="py-4 text-right">₹{(item.rate || 0).toLocaleString("en-IN")}</td>
                          <td className="py-4 text-right font-bold text-slate-800">
                            ₹{(item.amount || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td colSpan="3" className="py-5"></td>
                        <td className="py-5 font-bold text-slate-500 text-right">TOTAL AMOUNT:</td>
                        <td className="py-5 font-black text-2xl text-slate-900 text-right">
                          ₹{(selectedChallan.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* SLIP DECORATION */}
                <div className="border-t border-dashed border-slate-200 pt-6 text-center text-slate-400 text-sm">
                  <p>Computer made shade can not be Return.</p>
                  <p className="mt-1 font-bold text-slate-500">Thank You</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedChallan(null)}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-2xl font-bold transition-colors"
                >
                  Close Receipt
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