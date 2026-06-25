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

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-in">

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">

              Payment Reports

            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">

              Track labour payments, processed payouts, monthly histories, and balances.

            </p>

          </div>

        </div>

        {/* SEARCH BAR */}

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-4 flex items-center gap-4 mb-8 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">

          <FaSearch className="text-slate-400 dark:text-slate-500 text-lg" />

          <input
            type="text"
            placeholder="Search by labour name or contractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />

        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-905 rounded-3xl shadow-sm p-16 text-center border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
            <FaClipboardList className="text-slate-350 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No payment records found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try searching with a different name or contractor.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px] border-collapse">

                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">

                  <tr>

                    <th className="px-6 py-4 text-left">
                      Labour
                    </th>

                    <th className="px-6 py-4 text-left">
                      Month
                    </th>

                    <th className="px-6 py-4 text-left">
                      Contractor
                    </th>

                    <th className="px-6 py-4 text-left">
                      Salary
                    </th>

                    <th className="px-6 py-4 text-left">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {filteredReports.map(
                    (report, index) => (

                      <tr
                        key={report._id}
                        style={{ "--stagger-delay": `${index * 20}ms` }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors duration-150 animate-slide-in-staggered"
                      >

                        <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white font-outfit text-sm">

                          {
                            report.labour?.name ||
                            report.labourName ||
                            "Deleted Labour"
                          }

                        </td>

                        <td className="px-6 py-4.5 text-sm font-semibold text-slate-700 dark:text-slate-350">

                          {
                            report.month
                          }

                        </td>

                        <td className="px-6 py-4.5 text-sm font-semibold text-slate-700 dark:text-slate-350">

                          {getContractorNames(report.siteName)}

                        </td>

                        <td className="px-6 py-4.5 font-bold text-emerald-600 dark:text-emerald-450 font-outfit text-base">

                          ₹<AnimatedCounter value={report.totalSalary} />

                        </td>

                        <td className="px-6 py-4.5">

                          <span className={
                            report.paymentStatus === "Paid" 
                              ? "badge-present" 
                              : "badge-halfday"
                          }>
                            {report.paymentStatus}
                          </span>

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

export default PaymentReport;