import MainLayout from "../layouts/MainLayout";

import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

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
                (item) => (

                  <tr
                    key={
                      item.labourId
                    }
                    className="border-b"
                  >

                    <td className="p-5 font-bold">

                      {
                        item.labourName
                      }

                    </td>

                    <td className="p-5">

                      {
                        item.presentDays
                      }

                    </td>

                    <td className="p-5">

                      {
                        item.halfDays
                      }

                    </td>

                    <td className="p-5">

                      {
                        item.overtime !== undefined ? item.overtime : (item.nightShift || 0)
                      }

                    </td>

                    <td className="p-5 text-orange-500">

                      ₹
                      {
                        item.teaExpense
                      }

                    </td>

                    <td className="p-5 text-orange-500">

                      ₹
                      {
                        item.bhada
                      }

                    </td>

                    <td className="p-5 text-red-500">

                      ₹
                      {
                        item.advance
                      }

                    </td>

                    <td className="p-5 font-bold text-green-600">

                      ₹
                      {
                        item.totalSalary
                      }

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </MainLayout>

  );

};

export default Salary;