import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import API from "../services/api";

import {
  FaUsers,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaBuilding,
  FaHistory,
} from "react-icons/fa";

const Dashboard = () => {

  const [dashboardData, setDashboardData] =
    useState({

      totalLabours: 0,
      totalAttendance: 0,
      pendingPayments: 0,
      totalSites: 0,
      monthlyPayroll: 0,

      recentAttendance: [],
      recentPayments: [],

    });

  useEffect(() => {

    fetchDashboard();

  }, []);

  const fetchDashboard =
    async () => {

      try {

        const res =
          await API.get(
            "/dashboard"
          );

        setDashboardData(
          res.data
        );

      } catch (error) {

        console.log(error);

      }

    };

  return (

    <MainLayout>

      <div className="p-6">

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-slate-800">

            Dashboard Overview

          </h1>

          <p className="text-slate-500 mt-2">

            Welcome to VC Dreams Contractor ERP

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-slate-500">

                  Total Labours

                </p>

                <h1 className="text-4xl font-bold text-blue-900">

                  {dashboardData.totalLabours}

                </h1>

              </div>

              <FaUsers className="text-4xl text-blue-600" />

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-slate-500">

                  Present Records

                </p>

                <h1 className="text-4xl font-bold text-green-600">

                  {dashboardData.totalAttendance}

                </h1>

              </div>

              <FaClipboardCheck className="text-4xl text-green-600" />

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-slate-500">

                  Pending Payments

                </p>

                <h1 className="text-3xl font-bold text-red-500">

                  ₹{dashboardData.pendingPayments}

                </h1>

              </div>

              <FaMoneyBillWave className="text-4xl text-red-500" />

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-slate-500">

                  Active Sites

                </p>

                <h1 className="text-4xl font-bold text-purple-600">

                  {dashboardData.totalSites}

                </h1>

              </div>

              <FaBuilding className="text-4xl text-purple-600" />

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex justify-between">

              <div>

                <p className="text-slate-500">

                  Monthly Payroll

                </p>

                <h1 className="text-3xl font-bold text-emerald-600">

                  ₹{dashboardData.monthlyPayroll}

                </h1>

              </div>

              <FaMoneyBillWave className="text-4xl text-emerald-600" />

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex items-center gap-3 mb-6">

              <FaHistory />

              <h2 className="text-2xl font-bold">

                Recent Attendance

              </h2>

            </div>

            <div className="space-y-4">

              {dashboardData.recentAttendance?.map(
                (attendance) => (

                  <div
                    key={attendance._id}
                    className="flex justify-between items-center bg-slate-50 p-4 rounded-xl"
                  >

                    <div>

                      <h3 className="font-semibold">

                        {attendance.labour?.name ||
                          attendance.labourName ||
                          "Deleted Labour"}

                      </h3>

                      <p className="text-sm text-slate-500">

                        {new Date(
                          attendance.date
                        ).toLocaleDateString()}

                      </p>

                    </div>

                    <span
                      className={
                        attendance.status ===
                        "Present"
                          ? "text-green-600 font-bold"
                          : "text-red-600 font-bold"
                      }
                    >

                      {attendance.status}

                    </span>

                  </div>

                )
              )}

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex items-center gap-3 mb-6">

              <FaMoneyBillWave />

              <h2 className="text-2xl font-bold">

                Recent Payments

              </h2>

            </div>

            <div className="space-y-4">

              {dashboardData.recentPayments?.map(
                (payment) => (

                  <div
                    key={payment._id}
                    className="flex justify-between items-center bg-slate-50 p-4 rounded-xl"
                  >

                    <div>

                      <h3 className="font-semibold">

                        {payment.labour?.name ||
                          payment.labourName ||
                          "Deleted Labour"}

                      </h3>

                      <p className="text-sm text-slate-500">

                        {payment.month} {payment.year}

                      </p>

                    </div>

                    <div className="text-right">

                      <p className="font-bold">

                        ₹{payment.totalSalary}

                      </p>

                      <p
                        className={
                          payment.paymentStatus ===
                          "Paid"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >

                        {payment.paymentStatus}

                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    </MainLayout>

  );

};

export default Dashboard;