import MainLayout from "../layouts/MainLayout";

import { useEffect, useState } from "react";

import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Sites = () => {

  const [sites, setSites] = useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedSite, setSelectedSite] =
    useState(null);

  const [siteLabours, setSiteLabours] =
    useState([]);
  const [todayPresent, setTodayPresent] =
    useState(0);
  
  const [totalDailyWage, setTotalDailyWage] =
    useState(0);
  const [showHistoryModal,
      setShowHistoryModal] =
      useState(false);
    
  

  const [editingSite, setEditingSite] =
    useState(null);

  const [formData, setFormData] =
    useState({

      name: "",

      location: "",

      progress: 0,

    });
  
  
  const [selectedLabour, setSelectedLabour] =
    useState(null);
  
  
  

  useEffect(() => {

    fetchSites();

  }, []);

  const fetchSites = async () => {

    try {

      const res = await API.get("/sites");

      setSites(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };

  const createSite = async () => {

    try {

      await API.post("/sites", formData);

      fetchSites();

      setShowModal(false);

      setFormData({

        name: "",

        location: "",

        progress: 0,

      });

    } catch (error) {

      console.log(error);

    }

  };

  const deleteSite = async (id) => {

    try {

      await API.delete(`/sites/${id}`);

      fetchSites();

    } catch (error) {

      console.log(error);

    }

  };

  const updateSite = async () => {

    try {

      await API.put(

        `/sites/${editingSite._id}`,

        editingSite

      );

      fetchSites();

      setEditingSite(null);

    } catch (error) {

      console.log(error);

    }

  };

  const viewSiteDetails = async (site) => {
    try {
      setSelectedSite(site);
  
      const labourRes =
        await API.get("/labours");
  
      const filteredLabours =
        labourRes.data.filter(
          (labour) =>
            labour.assignedSite?._id ===
            site._id
        );
  
      setSiteLabours(filteredLabours);
  
      const wageTotal =
        filteredLabours.reduce(
          (sum, labour) =>
            sum +
            Number(
              labour.dailyWage || 0
            ),
          0
        );
  
      setTotalDailyWage(
        wageTotal
      );
  
      try {
        const attendanceRes =
          await API.get(
            "/attendance"
          );
  
        const today =
          new Date()
            .toISOString()
            .split("T")[0];
  
        const presentCount =
          attendanceRes.data.filter(
            (attendance) =>
              attendance.status ===
                "Present" &&
              filteredLabours.some(
                (labour) =>
                  labour._id ===
                  attendance.labour
              ) &&
              attendance.date
                ?.split("T")[0] ===
                today
          ).length;
  
        setTodayPresent(
          presentCount
        );
  
      } catch (err) {
        console.log(err);
        setTodayPresent(0);
      }
  
    } catch (error) {
      console.log(error);
    }
  };
   
  
  
  
  const openHistory = (
    labour
  ) => {
  
    setSelectedLabour(
      labour
    );
  
    setShowHistoryModal(
      true
    );
  
  };
  return (

    <MainLayout>

      <div>

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-extrabold text-slate-800">

              Site Management

            </h1>

            <p className="text-slate-500 mt-3 text-lg">

              Manage all construction and painting sites

            </p>

          </div>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
          >

            + Add New Site

          </button>

        </div>

        <div className="grid grid-cols-3 gap-8">

          {sites.map((site) => (

            <div
              key={site._id}
              className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 hover:scale-105 transition-all duration-300"
            >

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-2xl font-bold text-slate-800">

                    {site.name}

                  </h2>

                  <p className="text-slate-500 mt-2">

                    {site.location}

                  </p>

                </div>

                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">

                  {site.status}

                </span>

              </div>

              <div className="space-y-5">

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="font-medium">

                      Project Progress

                    </span>

                    <span className="font-bold">

                      {site.progress}%

                    </span>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-4">

                    <div
                      className="bg-blue-700 h-4 rounded-full"
                      style={{
                        width:
                          `${site.progress}%`,
                      }}
                    ></div>

                  </div>

                </div>

                <div className="flex gap-3 pt-4">

                  <button
                    onClick={() =>
                      viewSiteDetails(site)
                    }
                    className="bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-2xl font-semibold transition-all duration-300"
                  >

                    Details

                  </button>

                  <button
                    onClick={() =>
                      setEditingSite(site)
                    }
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-3 rounded-2xl font-semibold transition-all duration-300"
                  >

                    Edit

                  </button>

                  <button
                    onClick={() =>
                      deleteSite(site._id)
                    }
                    className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-3 rounded-2xl font-semibold transition-all duration-300"
                  >

                    Delete

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {
          showModal && (

            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

              <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl">

                <h2 className="text-3xl font-bold text-slate-800 mb-8">

                  Add New Site

                </h2>

                <div className="space-y-5">

                  <input
                    type="text"
                    name="name"
                    placeholder="Site Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border p-4 rounded-2xl"
                  />

                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border p-4 rounded-2xl"
                  />

                  <input
                    type="number"
                    name="progress"
                    placeholder="Progress %"
                    value={formData.progress}
                    onChange={handleChange}
                    className="w-full border p-4 rounded-2xl"
                  />

                  <div className="flex gap-4 pt-4">

                    <button
                      onClick={createSite}
                      className="bg-blue-900 text-white px-6 py-3 rounded-2xl hover:bg-blue-800"
                    >

                      Save Site

                    </button>

                    <button
                      onClick={() =>
                        setShowModal(false)
                      }
                      className="bg-slate-200 px-6 py-3 rounded-2xl"
                    >

                      Cancel

                    </button>

                  </div>

                </div>

              </div>

            </div>

          )
        }

        {
          editingSite && (

            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

              <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl">

                <h2 className="text-3xl font-bold text-slate-800 mb-8">

                  Edit Site

                </h2>

                <div className="space-y-5">

                  <input
                    type="text"
                    value={editingSite.name}
                    onChange={(e) =>
                      setEditingSite({

                        ...editingSite,

                        name:
                          e.target.value,

                      })
                    }
                    className="w-full border p-4 rounded-2xl"
                  />

                  <input
                    type="text"
                    value={editingSite.location}
                    onChange={(e) =>
                      setEditingSite({

                        ...editingSite,

                        location:
                          e.target.value,

                      })
                    }
                    className="w-full border p-4 rounded-2xl"
                  />

                  <input
                    type="number"
                    value={editingSite.progress}
                    onChange={(e) =>
                      setEditingSite({

                        ...editingSite,

                        progress:
                          e.target.value,

                      })
                    }
                    className="w-full border p-4 rounded-2xl"
                  />

                  <select
                    value={editingSite.status}
                    onChange={(e) =>
                      setEditingSite({

                        ...editingSite,

                        status:
                          e.target.value,

                      })
                    }
                    className="w-full border p-4 rounded-2xl"
                  >

                    <option>
                      Active
                    </option>

                    <option>
                      Completed
                    </option>

                  </select>

                  <div className="flex gap-4 pt-4">

                    <button
                      onClick={updateSite}
                      className="bg-blue-900 text-white px-6 py-3 rounded-2xl hover:bg-blue-800"
                    >

                      Update Site

                    </button>

                    <button
                      onClick={() =>
                        setEditingSite(null)
                      }
                      className="bg-slate-200 px-6 py-3 rounded-2xl"
                    >

                      Cancel

                    </button>

                  </div>

                </div>

              </div>

            </div>

          )
        }

        {
          selectedSite && (

            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">

              <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">

                <div className="bg-gradient-to-r from-blue-950 to-slate-900 p-10 rounded-t-3xl text-white">

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-5xl font-bold">

                        {selectedSite.name}

                      </h2>

                      <p className="text-slate-300 text-lg mt-3">

                        {selectedSite.location}

                      </p>

                    </div>

                    <button
                      onClick={() =>
                        setSelectedSite(null)
                      }
                      className="bg-white/20 hover:bg-white/30 w-14 h-14 rounded-full text-3xl"
                    >

                      ×

                    </button>

                  </div>

                </div>

                <div className="p-10">

                  <div className="grid grid-cols-4 gap-6 mb-10">

                    <div className="bg-blue-100 rounded-3xl p-6">

                      <p className="text-slate-500">

                        Total Labourers

                      </p>

                      <h3 className="text-4xl font-bold text-blue-900 mt-3">

                        {siteLabours.length}

                      </h3>

                    </div>

                    <div className="bg-green-100 rounded-3xl p-6">

                      <p className="text-slate-500">

                        Present Today

                      </p>

                      <h3 className="text-4xl font-bold text-green-700 mt-3">

                        {todayPresent}

                      </h3>

                    </div>

                    <div className="bg-orange-100 rounded-3xl p-6">

                      <p className="text-slate-500">

                        Progress

                      </p>

                      <h3 className="text-4xl font-bold text-orange-600 mt-3">

                        {selectedSite.progress}%

                      </h3>

                    </div>

                    <div className="bg-purple-100 rounded-3xl p-6">

                      <p className="text-slate-500">

                        Progress

                      </p>

                      <h3 className="text-4xl font-bold text-purple-700 mt-3">

                        {selectedSite.progress}%

                      </h3>

                    </div>

                  </div>

                  <div className="bg-slate-50 rounded-3xl p-8">

                    <h3 className="text-3xl font-bold text-slate-800 mb-8">

                      Working Labourers

                    </h3>

                    <table className="w-full">

                      <thead className="bg-slate-200">

                        <tr>

                          <th className="text-left p-5">
                            Name
                          </th>

                          <th className="text-left p-5">
                            Phone
                          </th>

                          <th className="text-left p-5">
                            Daily Wage
                          </th>

                          <th className="text-left p-5">
                            Site Joined Date
                          </th>
                          <th className="text-left p-5">
                            History
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {siteLabours.map(
                          (labour) => (

                            <tr
                              key={labour._id}
                              className="border-b"
                            >

                              <td className="p-5 font-semibold">

                                {labour.name}

                              </td>

                              <td className="p-5">

                                {labour.phone}

                              </td>

                              <td className="p-5 text-green-600 font-bold">

                                ₹{labour.dailyWage}

                              </td>

                              <td className="p-5">

                                {
                                  labour.siteAssignedDate
                                    ? new Date(
                                        labour.siteAssignedDate
                                      ).toLocaleDateString()
                                    : "N/A"
                                }

                              </td>
                              <td className="p-5">

                              <button
                                onClick={() =>
                                  openHistory(labour)
                                }
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                              >
                                History
                              </button>

                            </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

            </div>

          )
        }

      </div>
     
{
  showHistoryModal &&
  selectedLabour && (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl">

        <div className="flex justify-between items-center mb-8">

          <h2 className="text-3xl font-bold">

            {selectedLabour.name} Site History

          </h2>

          <button
            onClick={() =>
              setShowHistoryModal(false)
            }
            className="text-3xl font-bold"
          >
            ×
          </button>

        </div>

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Site
              </th>

              <th className="p-4 text-left">
                From Date
              </th>

              <th className="p-4 text-left">
                To Date
              </th>

              <th className="p-4 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {selectedLabour.siteHistory?.map(
              (history) => (

                <tr
                  key={history._id}
                  className="border-b"
                >

                  <td className="p-4">

                    {history.site?.name}

                  </td>

                  <td className="p-4">

                    {
                      new Date(
                        history.fromDate
                      ).toLocaleDateString()
                    }

                  </td>

                  <td className="p-4">

                    {
                      history.toDate

                        ? new Date(
                            history.toDate
                          ).toLocaleDateString()

                        : "Present"
                    }

                  </td>

                  <td className="p-4">

                    <span
                      className={
                        history.active

                          ? "text-green-600 font-bold"

                          : "text-slate-500"
                      }
                    >

                      {
                        history.active

                          ? "Active"

                          : "Completed"
                      }

                    </span>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  )
}

    </MainLayout>

  );

};

export default Sites;
