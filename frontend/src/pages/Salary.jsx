import MainLayout from "../layouts/MainLayout";

import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";
import { FaClipboardList, FaSearch } from "react-icons/fa";
import AnimatedCounter from "../components/AnimatedCounter";

const Salary = () => {

  const [salaryData, setSalaryData] =
    useState([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    fetchSalary();

  }, []);

  const fetchSalary = async () => {

    try {

      const res = await API.get(
        "/salary"
      );

      setSalaryData(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const filteredSalary =
    salaryData.filter((item) =>

      item.labourName
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <MainLayout>

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">

              Salary Management

            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">

              Monthly payroll calculation, overtime, tea allowance, and advance summaries.

            </p>

          </div>

        </div>

        {/* SEARCH */}

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-4 flex items-center gap-4 mb-8 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">

          <FaSearch className="text-slate-400 dark:text-slate-500 text-lg" />

          <input
            type="text"
            placeholder="Search by labourer name..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-transparent outline-none text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />

        </div>

        {/* SUMMARY TABLE */}

        {filteredSalary.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-16 text-center border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
            <FaClipboardList className="text-slate-355 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No salary records found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try searching for a different labourer name.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-100 dark:border-slate-800">

              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">

                Salary Summary

              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] border-collapse">

                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">

                  <tr>

                    <th className="px-6 py-4 text-left font-semibold">

                      Labour

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Present Days

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Half Days

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Overtime (Hrs)

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Tea

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Bhada

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Advance

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Total Salary

                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {filteredSalary.map(
                    (item, index) => (

                      <tr
                        key={
                          item.labourId
                        }
                        style={{ "--stagger-delay": `${index * 20}ms` }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150 animate-slide-in-staggered"
                      >

                        <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-slate-100 font-outfit text-sm">

                          {
                            item.labourName
                          }

                        </td>

                        <td className="px-6 py-4.5 text-sm text-slate-700 dark:text-slate-300 font-medium">

                          <AnimatedCounter value={item.presentDays} formatter={(v) => v} />

                        </td>

                        <td className="px-6 py-4.5 text-sm text-slate-700 dark:text-slate-300 font-medium">

                          <AnimatedCounter value={item.halfDays} formatter={(v) => v} />

                        </td>

                        <td className="px-6 py-4.5 text-sm text-slate-700 dark:text-slate-300 font-medium">

                          <AnimatedCounter value={item.overtime !== undefined ? item.overtime : (item.nightShift || 0)} formatter={(v) => v} />

                        </td>

                        <td className="px-6 py-4.5 text-sm text-amber-600 dark:text-amber-400 font-semibold font-outfit">

                          ₹<AnimatedCounter value={item.teaExpense} />

                        </td>

                        <td className="px-6 py-4.5 text-sm text-amber-600 dark:text-amber-400 font-semibold font-outfit">

                          ₹<AnimatedCounter value={item.bhada} />

                        </td>

                        <td className="px-6 py-4.5 text-sm text-rose-600 dark:text-rose-400 font-semibold font-outfit">

                          ₹<AnimatedCounter value={item.advance} />

                        </td>

                        <td className="px-6 py-4.5 text-emerald-600 dark:text-emerald-450 font-bold font-outfit text-base">

                          ₹<AnimatedCounter value={item.totalSalary} />

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

    </MainLayout>

  );

};

export default Salary;