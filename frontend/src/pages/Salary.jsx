import MainLayout from "../layouts/MainLayout";

import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";
import { FaClipboardList } from "react-icons/fa";
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

      <div>

        <h1 className="text-5xl font-extrabold text-slate-800">

          Salary Management

        </h1>

        <p className="text-slate-500 mt-3 text-lg">

          Monthly payroll and salary calculations

        </p>

        <div className="mt-8 mb-6">

          <input
            type="text"
            placeholder="Search labour..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full border border-slate-300 p-4 rounded-2xl"
          />

        </div>

        {filteredSalary.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-16 text-center border border-slate-100 dark:border-slate-700/50 animate-fade-in">
            <FaClipboardList className="text-slate-300 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No salary records found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try searching for a different labourer.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-3xl font-bold mb-8">

              Salary Summary

            </h2>

            <table className="w-full">

            <thead className="bg-blue-950 text-white">

              <tr>

                <th className="p-5 text-left">

                  Labour

                </th>

                <th className="p-5 text-left">

                  Present Days

                </th>

                <th className="p-5 text-left">

                  Half Days

                </th>

                <th className="p-5 text-left">

                  Overtime (Hrs)

                </th>

                <th className="p-5 text-left">

                  Tea

                </th>

                <th className="p-5 text-left">

                  Bhada

                </th>

                <th className="p-5 text-left">

                  Advance

                </th>

                <th className="p-5 text-left">

                  Total Salary

                </th>

              </tr>

            </thead>

            <tbody>

              {filteredSalary.map(
                (item, index) => (

                  <tr
                    key={
                      item.labourId
                    }
                    style={{ "--stagger-delay": `${index * 20}ms` }}
                    className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors duration-150 animate-slide-in-staggered"
                  >

                    <td className="p-5 font-bold">

                      {
                        item.labourName
                      }

                    </td>

                    <td className="p-5">

                      <AnimatedCounter value={item.presentDays} formatter={(v) => v} />

                    </td>

                    <td className="p-5">

                      <AnimatedCounter value={item.halfDays} formatter={(v) => v} />

                    </td>

                    <td className="p-5">

                      <AnimatedCounter value={item.overtime !== undefined ? item.overtime : (item.nightShift || 0)} formatter={(v) => v} />

                    </td>

                    <td className="p-5 text-orange-500 font-semibold font-outfit">

                      ₹<AnimatedCounter value={item.teaExpense} />

                    </td>

                    <td className="p-5 text-orange-500 font-semibold font-outfit">

                      ₹<AnimatedCounter value={item.bhada} />

                    </td>

                    <td className="p-5 text-red-500 font-semibold font-outfit">

                      ₹<AnimatedCounter value={item.advance} />

                    </td>

                    <td className="p-5 font-bold text-green-600 font-outfit text-lg">

                      ₹<AnimatedCounter value={item.totalSalary} />

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

export default Salary;