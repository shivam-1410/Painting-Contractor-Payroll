import MainLayout from "../layouts/MainLayout";

import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

import toast from "react-hot-toast";

import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
} from "react-icons/fa";

import AnimatedCounter from "../components/AnimatedCounter";

const Payroll = () => {

  const [payrolls,
    setPayrolls] =
    useState([]);

  const [month, setMonth] =
    useState("");

  const [year, setYear] =
    useState(
      new Date().getFullYear()
    );

  useEffect(() => {

    fetchPayrolls();

  }, []);

  const fetchPayrolls =
    async () => {

      try {

        const res =
          await API.get(
            "/payroll"
          );

        setPayrolls(
          res.data
        );

      } catch (error) {

        console.log(error);

      }

    };

  const generatePayroll =
    async () => {

      try {

        await API.post(
          "/payroll/generate",
          {

            month,

            year,

          }
        );

        toast.success(
          "Payroll Generated Successfully"
        );

        fetchPayrolls();

      } catch (error) {

        console.log(error);

        toast.error(
          error.response.data.message
        );

      }

    };

  const markAsPaid =
    async (id) => {

      try {

        await API.put(
          `/payroll/pay/${id}`
        );

        toast.success(
          "Payment Marked As Paid"
        );

        fetchPayrolls();

      } catch (error) {

        console.log(error);

      }

    };

  return (

    <MainLayout>

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">

              Payroll Management

            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">

              Generate and manage monthly payouts, calculate labor balances, and track payment status.

            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-3 shadow-sm">

            <select
              value={month}
              onChange={(e) =>
                setMonth(
                  e.target.value
                )
              }
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-200"
            >

              <option value="">
                Select Month
              </option>

              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}

            </select>

            <input
              type="number"
              value={year}
              onChange={(e) =>
                setYear(
                  e.target.value
                )
              }
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-200 w-24 text-center font-bold"
            />

            <button
              onClick={
                generatePayroll
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
            >

              Generate Payroll

            </button>

          </div>

        </div>

        {/* TABLE */}

        {payrolls.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-16 text-center border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
            <FaClipboardList className="text-slate-350 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No payroll records found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Select a month and year to generate payroll.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">

            <table className="w-full border-collapse">

              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">

                <tr>

                  <th className="px-6 py-4 text-left">

                    Labour

                  </th>

                  <th className="px-6 py-4 text-left">

                    Month

                  </th>

                  <th className="px-6 py-4 text-left">

                    Salary

                  </th>

                  <th className="px-6 py-4 text-left">

                    Status

                  </th>

                  <th className="px-6 py-4 text-left">

                    Action

                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                {payrolls.map(
                  (payroll, index) => (

                    <tr
                      key={payroll._id}
                      style={{ "--stagger-delay": `${index * 20}ms` }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-155 animate-slide-in-staggered"
                    >

                      <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white font-outfit text-sm">

                        {
                          payroll.labour?.name ||
                          payroll.labourName ||
                          "Deleted Labour"
                        }

                      </td>

                      <td className="px-6 py-4.5 text-sm font-semibold text-slate-700 dark:text-slate-350">

                        {
                          payroll.month
                        }

                        {" "}

                        {
                          payroll.year
                        }

                      </td>

                      <td className="px-6 py-4.5 font-bold text-emerald-600 dark:text-emerald-450 font-outfit text-base">

                        ₹<AnimatedCounter value={payroll.totalSalary} />

                      </td>

                      <td className="px-6 py-4.5">

                        {payroll.paymentStatus ===
                        "Paid" ? (

                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-800/50 font-outfit">

                            <FaCheckCircle className="text-emerald-500" />

                            Paid

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-800/50 font-outfit">

                            <FaClock className="text-amber-500" />

                            Pending

                          </span>

                        )}

                      </td>

                      <td className="px-6 py-4.5">

                        {payroll.paymentStatus !==
                          "Paid" && (

                          <button
                            onClick={() =>
                              markAsPaid(
                                payroll._id
                              )
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/10 active:scale-95 hover:scale-[1.03] flex items-center gap-1.5"
                          >

                            <FaMoneyBillWave />

                            Mark Paid

                          </button>

                        )}

                      </td>

                    </tr>

                  )
              )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </MainLayout>

  );

};

export default Payroll;
