import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  FaPlus,
  FaTrash,
  FaMoneyBillWave,
  FaBuilding,
} from "react-icons/fa";

const SiteExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [sites, setSites] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    site: "",
    expenseType: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchExpenses();
    fetchSites();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/site-expenses");
      setExpenses(res.data);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createExpense = async () => {
    try {
      await API.post(
        "/site-expenses",
        formData
      );

      fetchExpenses();

      setShowModal(false);

      setFormData({
        site: "",
        expenseType: "",
        amount: "",
        description: "",
        date: new Date()
          .toISOString()
          .split("T")[0],
      });

    } catch (error) {
      console.log(error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await API.delete(
        `/site-expenses/${id}`
      );

      fetchExpenses();

    } catch (error) {
      console.log(error);
    }
  };

  const totalExpenses =
    expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount),
      0
    );

  const currentMonth =
    new Date().getMonth();

  const currentYear =
    new Date().getFullYear();

  const monthlyExpenses =
    expenses
      .filter((item) => {
        const date =
          new Date(item.date);

        return (
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        );
      })
      .reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

  return (
    <MainLayout>

      <div>

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-extrabold text-slate-800">
              Site Expenses
            </h1>

            <p className="text-slate-500 mt-3 text-lg">
              Manage all project expenses
            </p>

          </div>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="bg-blue-900 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3"
          >

            <FaPlus />

            Add Expense

          </button>

        </div>

        <div className="grid grid-cols-3 gap-8 mb-10">

          <div className="bg-white rounded-3xl shadow-xl p-8">

            <div className="flex justify-between">

              <div>

                <p className="text-slate-500">
                  Total Expenses
                </p>

                <h2 className="text-4xl font-bold text-red-600 mt-3">
                  ₹{totalExpenses}
                </h2>

              </div>

              <FaMoneyBillWave className="text-red-500 text-5xl" />

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">

            <div className="flex justify-between">

              <div>

                <p className="text-slate-500">
                  Monthly Expenses
                </p>

                <h2 className="text-4xl font-bold text-orange-600 mt-3">
                  ₹{monthlyExpenses}
                </h2>

              </div>

              <FaMoneyBillWave className="text-orange-500 text-5xl" />

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">

            <div className="flex justify-between">

              <div>

                <p className="text-slate-500">
                  Total Records
                </p>

                <h2 className="text-4xl font-bold text-blue-700 mt-3">
                  {expenses.length}
                </h2>

              </div>

              <FaBuilding className="text-blue-700 text-5xl" />

            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <table className="w-full">

            <thead className="bg-blue-950 text-white">

              <tr>

                <th className="p-5 text-left">
                  Date
                </th>

                <th className="p-5 text-left">
                  Site
                </th>

                <th className="p-5 text-left">
                  Expense Type
                </th>

                <th className="p-5 text-left">
                  Amount
                </th>

                <th className="p-5 text-left">
                  Description
                </th>

                <th className="p-5 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {expenses.map(
                (expense) => (

                  <tr
                    key={expense._id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-5">
                      {new Date(
                        expense.date
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-5 font-semibold">
                      {expense.site?.name}
                    </td>

                    <td className="p-5">
                      {expense.expenseType}
                    </td>

                    <td className="p-5 text-red-600 font-bold">
                      ₹{expense.amount}
                    </td>

                    <td className="p-5">
                      {expense.description}
                    </td>

                    <td className="p-5">

                      <button
                        onClick={() =>
                          deleteExpense(
                            expense._id
                          )
                        }
                        className="bg-red-100 text-red-600 p-3 rounded-xl"
                      >

                        <FaTrash />

                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {showModal && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white rounded-3xl p-8 w-full max-w-xl">

              <h2 className="text-3xl font-bold mb-8">
                Add Expense
              </h2>

              <div className="space-y-5">

                <select
                  name="site"
                  value={formData.site}
                  onChange={handleChange}
                  className="w-full border p-4 rounded-2xl"
                >

                  <option value="">
                    Select Site
                  </option>

                  {sites.map((site) => (

                    <option
                      key={site._id}
                      value={site._id}
                    >
                      {site.name}
                    </option>

                  ))}

                </select>

                <input
                  type="text"
                  name="expenseType"
                  placeholder="Expense Type"
                  value={formData.expenseType}
                  onChange={handleChange}
                  className="w-full border p-4 rounded-2xl"
                />

                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full border p-4 rounded-2xl"
                />

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border p-4 rounded-2xl"
                />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border p-4 rounded-2xl"
                />

                <div className="flex gap-4">

                  <button
                    onClick={createExpense}
                    className="bg-blue-900 text-white px-6 py-3 rounded-2xl"
                  >
                    Save Expense
                  </button>

                  <button
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="bg-slate-200 px-6 py-3 rounded-2xl"
                  >
                    Cancel
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </MainLayout>
  );
};

export default SiteExpense;