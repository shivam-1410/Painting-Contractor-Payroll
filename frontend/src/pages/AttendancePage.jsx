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

      <div>

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-extrabold text-slate-800">

              Attendance Management

            </h1>

            <p className="text-slate-500 mt-3 text-lg">

              Manage labour attendance and expenses

            </p>

          </div>

          <div className="bg-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-4">

            <FaCalendarAlt className="text-blue-900 text-2xl" />

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
              className="outline-none text-lg font-semibold"
            />

          </div>

        </div>

        {/* SEARCH */}

        <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4 mb-8">

          <FaSearch className="text-slate-400 text-xl" />

          <input
            type="text"
            placeholder="Search labour..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full outline-none text-lg"
          />

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-3xl shadow-xl overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead className="bg-blue-950 text-white">

              <tr>

                <th className="p-5 text-left">

                  Labour

                </th>

                <th className="p-5 text-left">

                  Site

                </th>

                <th className="p-5 text-left">

                  Status

                </th>

                <th className="p-5 text-left">

                  Contractor

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

                  Action

                </th>

              </tr>

            </thead>

            <tbody>

              {filteredLabours.map(
                (labour) => {

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

                  return (

                    <tr
                      key={labour._id}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-5 font-bold">

                        {
                          labour.name
                        }

                      </td>

                      <td className="p-5">

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
                          className="border rounded-xl px-4 py-2 w-48 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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

                      <td className="p-5">

                        <select
                          defaultValue={
                            existing?.status ||
                            "Present"
                          }
                          onChange={(e) =>
                            handleChange(

                              labour._id,

                              "status",

                              e.target
                                .value
                            )
                          }
                          className="border rounded-xl px-4 py-2"
                        >

                          <option>
                            Present
                          </option>

                          <option>
                            Absent
                          </option>

                          <option>
                            Half Day
                          </option>

                        </select>

                      </td>

                      <td className="p-5 font-semibold text-slate-700 dark:text-slate-200">

                        {contractorName}

                      </td>

                      <td className="p-5">

                        <div className="flex items-center gap-2">

                          <FaClock className="text-purple-600" />

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
                            className="border rounded-xl px-4 py-2 w-24"
                          />

                        </div>

                      </td>

                      <td className="p-5">

                        <div className="flex items-center gap-2">

                          <FaCoffee className="text-orange-500" />

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
                            className="border rounded-xl px-4 py-2 w-24"
                          />

                        </div>

                      </td>

                      <td className="p-5">

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
                          className="border rounded-xl px-4 py-2 w-24"
                        />

                      </td>

                      <td className="p-5">

                        <div className="flex items-center gap-2">

                          <FaMoneyBillWave className="text-red-500" />

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
                            className="border rounded-xl px-4 py-2 w-24"
                          />

                        </div>

                      </td>

                      <td className="p-5">

                        <button

                          onClick={() =>
                            markAttendance(
                              labour._id
                            )
                          }

                          className={`text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
                            existing

                              ? "bg-orange-500 hover:bg-orange-600"

                              : "bg-blue-900 hover:bg-blue-800"
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

    </MainLayout>

  );

};

export default Attendance;