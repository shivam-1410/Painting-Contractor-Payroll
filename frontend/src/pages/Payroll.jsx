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
} from "react-icons/fa";

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

      <div>

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-extrabold text-slate-800">

              Payroll Management

            </h1>

            <p className="text-slate-500 mt-3 text-lg">

              Generate and manage official payroll records

            </p>

          </div>

          <div className="flex gap-4">

            <select
              value={month}
              onChange={(e) =>
                setMonth(
                  e.target.value
                )
              }
              className="border border-slate-300 rounded-2xl px-5 py-3"
            >

              <option value="">
                Select Month
              </option>

              <option>
                January
              </option>

              <option>
                February
              </option>

              <option>
                March
              </option>

              <option>
                April
              </option>

              <option>
                May
              </option>

              <option>
                June
              </option>

              <option>
                July
              </option>

              <option>
                August
              </option>

              <option>
                September
              </option>

              <option>
                October
              </option>

              <option>
                November
              </option>

              <option>
                December
              </option>

            </select>

            <input
              type="number"
              value={year}
              onChange={(e) =>
                setYear(
                  e.target.value
                )
              }
              className="border border-slate-300 rounded-2xl px-5 py-3 w-32"
            />

            <button

              onClick={
                generatePayroll
              }

              className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"

            >

              Generate Payroll

            </button>

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <table className="w-full">

            <thead className="bg-blue-950 text-white">

              <tr>

                <th className="p-5 text-left">

                  Labour

                </th>

                <th className="p-5 text-left">

                  Month

                </th>

                <th className="p-5 text-left">

                  Salary

                </th>

                <th className="p-5 text-left">

                  Status

                </th>

                <th className="p-5 text-left">

                  Action

                </th>

              </tr>

            </thead>

            <tbody>

              {payrolls.map(
                (payroll) => (

                  <tr
                    key={payroll._id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-5 font-bold">

                      {
                        payroll.labour?.name ||
                        payroll.labourName ||
                        "Deleted Labour"
                      }

                    </td>

                    <td className="p-5">

                      {
                        payroll.month
                      }

                      {" "}

                      {
                        payroll.year
                      }

                    </td>

                    <td className="p-5 font-bold text-green-600">

                      ₹
                      {
                        payroll.totalSalary
                      }

                    </td>

                    <td className="p-5">

                      {payroll.paymentStatus ===
                      "Paid" ? (

                        <div className="flex items-center gap-2 text-green-600 font-bold">
                            

                          <FaCheckCircle />

                          Paid

                        </div>

                      ) : (

                        <div className="flex items-center gap-2 text-orange-500 font-bold">

                          <FaClock />

                          Pending

                        </div>

                      )}

                    </td>

                    <td className="p-5">

                      {payroll.paymentStatus !==
                        "Paid" && (

                        <button

                          onClick={() =>
                            markAsPaid(
                              payroll._id
                            )
                          }

                          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl flex items-center gap-2"

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

      </div>

    </MainLayout>

  );

};

export default Payroll;
