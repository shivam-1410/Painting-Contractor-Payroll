import MainLayout from "../layouts/MainLayout";

import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

import toast from "react-hot-toast";

import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaCoffee,
  FaMoneyBillWave,
  FaClipboardList,
} from "react-icons/fa";

const Attendance = () => {

  const [labours, setLabours] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [attendanceDate,
    setAttendanceDate] =
    useState(

      new Date()
        .toISOString()
        .split("T")[0]

    );

  const [attendanceData,
    setAttendanceData] =
    useState({});

  const [existingAttendance,
    setExistingAttendance] =
    useState([]);

  const [sites, setSites] =
    useState([]);

  const [allAttendance, setAllAttendance] =
    useState([]);

  useEffect(() => {

    fetchLabours();
    fetchSites();

  }, []);

  useEffect(() => {

    setAttendanceData({});
    fetchAttendanceByDate();

  }, [attendanceDate]);

  const fetchLabours = async () => {

    try {

      const res = await API.get(
        "/labours"
      );

      setLabours(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const fetchSites = async () => {

    try {

      const res = await API.get(
        "/sites"
      );

      setSites(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const fetchAttendanceByDate =
    async () => {

      try {

        const res =
          await API.get(
            "/attendance"
          );

        setAllAttendance(res.data);

        const filtered =
          res.data.filter(
            (item) => {

              const itemDate =
                new Date(
                  item.date
                )

                  .toISOString()

                  .split("T")[0];

              return (
                itemDate ===
                attendanceDate
              );

            }
          );

        setExistingAttendance(
          filtered
        );

      } catch (error) {

        console.log(error);

      }

    };

  const handleChange = (
    labourId,
    field,
    value
  ) => {

    setAttendanceData({

      ...attendanceData,

      [labourId]: {

        ...attendanceData[
          labourId
        ],

        [field]: value,

      },

    });

  };

  const markAttendance =
    async (labourId) => {

      try {

        const data =
          attendanceData[
            labourId
          ] || {};

          const existing =
          existingAttendance.find(
            (item) =>
              item.labour?._id?.toString() ===
              labourId.toString()
          );

        await API.post(
          "/attendance",
          {

            labour:
              labourId,

            status:
              data.status ||
              existing?.status ||
              "Present",

            date:
              attendanceDate,

            halfDay:
              (data.status || existing?.status || "Present") === "Half Day" ? 1 : 0,

            overtime:
              data.overtime !== undefined
                ? Number(data.overtime)
                : (existing?.hasOwnProperty('overtime')
                  ? existing.overtime
                  : (existing?.nightShift || 0)),

            teaExpense:
              Number(
                data.teaExpense
              ) ||

              existing?.teaExpense ||

              0,

            bhada:
              Number(
                data.bhada
              ) ||

              existing?.bhada ||

              0,

            advance:
              Number(
                data.advance
              ) ||

              existing?.advance ||

              0,

            site:
              data.site !== undefined
                ? data.site
                : existing?.site?._id || existing?.site || (() => {
                    const lastAtt = allAttendance.find(
                      (item) =>
                        (item.labour?._id || item.labour)?.toString() === labourId.toString() &&
                        item.site
                    );
                    return lastAtt?.site?._id || lastAtt?.site || "";
                  })(),

          }
        );

        if (existing) {

          toast.success(
            "Attendance Updated Successfully"
          );

        } else {

          toast.success(
            "Attendance Saved Successfully"
          );

        }

        fetchAttendanceByDate();

      } catch (error) {

        console.log(error);

      }

    };

  const filteredLabours =
    labours.filter((labour) => {
      const matchesLabourName = labour.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

      const existing = existingAttendance.find(
        (item) =>
          item.labour?._id?.toString() ===
          labour._id.toString()
      );

      const selectedSiteId =
        attendanceData[labour._id]?.site !== undefined
          ? attendanceData[labour._id].site
          : existing?.site?._id || existing?.site || (() => {
              const lastAtt = allAttendance.find(
                (item) =>
                  (item.labour?._id || item.labour)?.toString() === labour._id.toString() &&
                  item.site
              );
              return lastAtt?.site?._id || lastAtt?.site || "";
            })();

      const selectedSiteObj = sites.find(s => (s._id || s).toString() === selectedSiteId?.toString());
      const contractorName = selectedSiteObj?.contractorName || "";
      const matchesContractorName = contractorName
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesLabourName || matchesContractorName;
    });

  return (

    <MainLayout>

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">

              Attendance Management

            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">

              Track daily attendance, overtime, tea allowance, and advance payouts.

            </p>

          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm px-5 py-3.5 flex items-center gap-4 transition-all duration-300 hover:shadow-md">

            <FaCalendarAlt className="text-indigo-600 dark:text-indigo-400 text-lg" />

            <input
              type="date"
              value={
                attendanceDate
              }
              onChange={(e) =>
                setAttendanceDate(
                  e.target.value
                )
              }
              className="bg-transparent outline-none text-base font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
            />

          </div>

        </div>

        {/* SEARCH */}

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-4 flex items-center gap-4 mb-8 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">

          <FaSearch className="text-slate-400 dark:text-slate-500 text-lg" />

          <input
            type="text"
            placeholder="Search by labour name or contractor..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-transparent outline-none text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />

        </div>

        {/* TABLE */}

        {filteredLabours.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-16 text-center border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
            <FaClipboardList className="text-slate-350 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No labourers found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try searching for a different labourer or check your active list.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px] border-collapse">

                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">

                  <tr>

                    <th className="px-6 py-4 text-left font-semibold">

                      Labour

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Site

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Status

                    </th>

                    <th className="px-6 py-4 text-left font-semibold">

                      Contractor

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

                      Action

                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {filteredLabours.map(
                    (labour, index) => {

                      const existing =
                      existingAttendance.find(
                        (item) =>
                          item.labour?._id?.toString() ===
                          labour._id.toString()
                      );

                      const selectedSiteId =
                        attendanceData[labour._id]?.site !== undefined
                          ? attendanceData[labour._id].site
                          : existing?.site?._id || existing?.site || (() => {
                              const lastAtt = allAttendance.find(
                                (item) =>
                                  (item.labour?._id || item.labour)?.toString() === labour._id.toString() &&
                                  item.site
                              );
                              return lastAtt?.site?._id || lastAtt?.site || "";
                            })();

                      const selectedSiteObj = sites.find(s => (s._id || s).toString() === selectedSiteId?.toString());
                      const contractorName = selectedSiteObj?.contractorName || "N/A";
                      const currentStatus =
                        attendanceData[labour._id]?.status !== undefined
                          ? attendanceData[labour._id].status
                          : existing?.status || "Present";

                      return (

                        <tr
                          key={labour._id}
                          style={{ "--stagger-delay": `${index * 25}ms` }}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150 animate-slide-in-staggered"
                        >

                          <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-slate-100 font-outfit text-sm">

                            {
                              labour.name
                            }

                          </td>

                          <td className="px-6 py-4.5">

                            <select
                              value={selectedSiteId}
                              onChange={(e) =>
                                handleChange(

                                  labour._id,

                                  "site",

                                  e.target
                                    .value
                                )
                              }
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
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

                          </td>

                          <td className="px-6 py-4.5">

                            <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-slate-850 transition-colors duration-300">
                              {["Present", "Absent", "Half Day"].map((statusOption) => {
                                const isSelected = currentStatus === statusOption;
                                let activeClass = "";
                                if (isSelected) {
                                  if (statusOption === "Present") activeClass = "bg-emerald-500 text-white shadow-sm";
                                  else if (statusOption === "Absent") activeClass = "bg-rose-500 text-white shadow-sm";
                                  else activeClass = "bg-amber-500 text-white shadow-sm";
                                } else {
                                  activeClass = "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60";
                                }
                                return (
                                  <button
                                    key={statusOption}
                                    onClick={() => handleChange(labour._id, "status", statusOption)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-[1.03] ${activeClass}`}
                                  >
                                    {statusOption}
                                  </button>
                                );
                              })}
                            </div>

                          </td>

                          <td className="px-6 py-4.5 text-sm font-semibold text-slate-700 dark:text-slate-350">

                            {contractorName}

                          </td>

                          <td className="px-6 py-4.5">

                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 w-28 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500 transition-all duration-200">

                              <FaClock className="text-indigo-500 dark:text-indigo-400 text-xs shrink-0" />

                              <input
                                type="number"
                                defaultValue={
                                  existing?.overtime !== undefined
                                    ? existing.overtime
                                    : (existing?.nightShift || 0)
                                }
                                onChange={(e) =>
                                  handleChange(

                                    labour._id,

                                    "overtime",

                                    e.target
                                      .value
                                  )
                                }
                                className="bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 w-full text-right font-medium"
                              />

                            </div>

                          </td>

                          <td className="px-6 py-4.5">

                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 w-28 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500 transition-all duration-200">

                              <span className="text-slate-400 dark:text-slate-500 text-xs shrink-0 font-medium font-outfit">₹</span>

                              <input
                                type="number"
                                defaultValue={
                                  existing?.teaExpense ||
                                  0
                                }
                                onChange={(e) =>
                                  handleChange(

                                    labour._id,

                                    "teaExpense",

                                    e.target
                                      .value
                                  )
                                }
                                className="bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 w-full text-right font-medium"
                              />

                            </div>

                          </td>

                          <td className="px-6 py-4.5">

                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 w-28 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500 transition-all duration-200">

                              <span className="text-slate-400 dark:text-slate-500 text-xs shrink-0 font-medium font-outfit">₹</span>

                              <input
                                type="number"
                                defaultValue={
                                  existing?.bhada ||
                                  0
                                }
                                onChange={(e) =>
                                  handleChange(

                                    labour._id,

                                    "bhada",

                                    e.target
                                      .value
                                  )
                                }
                                className="bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 w-full text-right font-medium"
                              />

                            </div>

                          </td>

                          <td className="px-6 py-4.5">

                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-1.5 w-28 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500 transition-all duration-200">

                              <span className="text-rose-500 dark:text-rose-400 text-xs shrink-0 font-medium font-outfit">₹</span>

                              <input
                                type="number"
                                defaultValue={
                                  existing?.advance ||
                                  0
                                }
                                onChange={(e) =>
                                  handleChange(

                                    labour._id,

                                    "advance",

                                    e.target
                                      .value
                                  )
                                }
                                className="bg-transparent outline-none text-sm text-rose-600 dark:text-rose-450 w-full text-right font-semibold"
                              />

                            </div>

                          </td>

                          <td className="px-6 py-4.5">

                            <button
                              onClick={() =>
                                markAttendance(
                                  labour._id
                                )
                              }
                              className={`w-24 font-bold py-2.5 rounded-xl shadow-sm text-xs transition-all duration-200 active:scale-[0.96] hover:scale-[1.03] text-white ${
                                existing
                                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
                                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10"
                              }`}
                            >

                              {existing

                                ? "Update"

                                : "Save"}

                            </button>

                          </td>

                        </tr>

                      );

                    }
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

export default Attendance;