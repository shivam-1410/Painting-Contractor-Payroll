import MainLayout from "../layouts/MainLayout";

import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";
import { FaSearch, FaClipboardList } from "react-icons/fa";
import AnimatedCounter from "../components/AnimatedCounter";

const PaymentReport =
() => {

  const [reports,
    setReports] =
    useState([]);

  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    fetchReports();
    fetchSites();

  }, []);

  const fetchSites =
    async () => {

      try {

        const res =
          await API.get(
            "/sites"
          );

        setSites(
          res.data || []
        );

      } catch (error) {

        console.log(error);

      }

    };

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

  const getContractorNames = (siteNameStr) => {
    if (!siteNameStr || siteNameStr === "N/A") return "N/A";
    const names = siteNameStr.split(", ").map(name => name.trim());
    const contractors = names.map(name => {
      const siteObj = sites.find(s => s.name === name);
      return siteObj?.contractorName;
    }).filter(Boolean);
    const uniqueContractors = [...new Set(contractors)];
    return uniqueContractors.length > 0 ? uniqueContractors.join(", ") : "N/A";
  };

  const filteredReports = reports.filter((report) => {
    const labourName = report.labour?.name || report.labourName || "Deleted Labour";
    const contractorName = getContractorNames(report.siteName);

    const matchesSearch =
      labourName.toLowerCase().includes(search.toLowerCase()) ||
      contractorName.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (

    <MainLayout>

      <div>

        <h1 className="text-5xl font-extrabold text-slate-800 mb-10">

          Payment Reports

        </h1>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4 mb-8">
          <FaSearch className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by labour or contractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-16 text-center border border-slate-100 dark:border-slate-700/50 animate-fade-in">
            <FaClipboardList className="text-slate-300 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No payment records found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try searching with a different name or contractor.</p>
          </div>
        ) : (
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

                  Contractor

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

              {filteredReports.map(
                (report, index) => (

                  <tr
                    key={report._id}
                    style={{ "--stagger-delay": `${index * 20}ms` }}
                    className="border-b hover:bg-slate-50 animate-slide-in-staggered"
                  >

                    <td className="p-5 font-bold">

                      {
                        report.labour?.name ||
                        report.labourName ||
                        "Deleted Labour"
                      }

                    </td>

                    <td className="p-5">

                      {
                        report.month
                      }

                    </td>

                    <td className="p-5 font-semibold text-slate-700 dark:text-slate-200">

                      {getContractorNames(report.siteName)}

                    </td>

                    <td className="p-5 font-bold text-green-600 font-outfit">

                      ₹<AnimatedCounter value={report.totalSalary} />

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
        )}

      </div>

    </MainLayout>

  );

};

export default PaymentReport;