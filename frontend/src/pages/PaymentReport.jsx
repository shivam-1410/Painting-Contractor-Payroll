import MainLayout from "../layouts/MainLayout";

import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

const PaymentReport =
() => {

  const [reports,
    setReports] =
    useState([]);

  useEffect(() => {

    fetchReports();

  }, []);

  const fetchReports =
    async () => {

      try {

        const res =
          await API.get(
            "/reports/payment"
          );

        setReports(
          res.data
        );

      } catch (error) {

        console.log(error);

      }

    };

  return (

    <MainLayout>

      <div>

        <h1 className="text-5xl font-extrabold text-slate-800 mb-10">

          Payment Reports

        </h1>

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

              </tr>

            </thead>

            <tbody>

              {reports.map(
                (report) => (

                  <tr
                    key={report._id}
                    className="border-b"
                  >

                    <td className="p-5 font-bold">

                      {
                        report.labour
                          ?.name
                      }

                    </td>

                    <td className="p-5">

                      {
                        report.month
                      }

                    </td>

                    <td className="p-5 font-bold text-green-600">

                      ₹
                      {
                        report.totalSalary
                      }

                    </td>

                    <td className="p-5">

                      {
                        report.paymentStatus
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

export default PaymentReport;