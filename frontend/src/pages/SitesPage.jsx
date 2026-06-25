import MainLayout from "../layouts/MainLayout";

import { useEffect, useState } from "react";

import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaBuilding } from "react-icons/fa";
import AnimatedCounter from "../components/AnimatedCounter";

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

      contractorName: "",

    });
  
  
  const [selectedLabour, setSelectedLabour] =
    useState(null);
  
  const [siteChallans, setSiteChallans] = useState([]);
  const [selectedDetailChallan, setSelectedDetailChallan] = useState(null);
  const [allChallans, setAllChallans] = useState([]);
  
  const getSiteSpecificChallanData = (challan) => {
    if (!challan) return { items: [], total: 0 };
    if (!selectedSite) return { items: challan.items || [], total: challan.totalAmount || 0 };
    const targetSiteName = (selectedSite.name || "").toLowerCase().trim();
    const targetSiteId = (selectedSite._id || selectedSite).toString().toLowerCase();
    const filteredItems = (challan.items || []).filter(
      (item) => {
        const itemName = item.site?.name?.toLowerCase().trim();
        if (itemName && targetSiteName) {
          return itemName === targetSiteName;
        }
        const itemSiteId = item.site?._id || item.site;
        if (!itemSiteId) return false;
        return itemSiteId.toString().toLowerCase() === targetSiteId;
      }
    );
    const filteredTotal = filteredItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return { items: filteredItems, total: filteredTotal };
  };
  
  
  

  useEffect(() => {

    fetchSites();
    fetchAllChallans();

  }, []);

  const fetchSites = async () => {

    try {

      const res = await API.get("/sites");

      setSites(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const fetchAllChallans = async () => {
    try {
      const res = await API.get("/challans");
      setAllChallans(res.data);
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

        contractorName: "",

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
      setSiteChallans([]);
  
      const labourRes =
        await API.get("/labours");
  
      const attendanceRes =
        await API.get("/attendance");
  
      const siteAttendance = attendanceRes.data.filter(
        (att) => (att.site?._id || att.site) === site._id
      );
  
      const uniqueLabourIds = [
        ...new Set(
          siteAttendance
            .map((att) => att.labour?._id || att.labour)
            .filter(Boolean)
        )
      ];
  
      const filteredLabours = labourRes.data.filter(
        (labour) => uniqueLabourIds.includes(labour._id)
      );
  
      const filteredLaboursWithDates = filteredLabours.map((labour) => {
        const workerAtts = siteAttendance.filter(
          (att) => (att.labour?._id || att.att?.labour) === labour._id
        );
        const earliestAtt = workerAtts.reduce((earliest, current) => {
          if (!earliest) return current;
          return new Date(current.date) < new Date(earliest.date) ? current : earliest;
        }, null);
        
        return {
          ...labour,
          siteAssignedDate: earliestAtt ? earliestAtt.date : null,
          siteHistory: (() => {
            const workerAllAtts = attendanceRes.data.filter(
              (att) => (att.labour?._id || att.labour) === labour._id
            );
            const sortedAsc = [...workerAllAtts].sort((a, b) => new Date(a.date) - new Date(b.date));
            const history = [];
            let currentPeriod = null;
            
            for (const att of sortedAsc) {
              const siteId = att.site?._id || att.site;
              const siteObj = att.site && typeof att.site === "object" ? att.site : { name: "N/A" };
              if (!siteId) continue;
              
              if (!currentPeriod || currentPeriod.siteId !== siteId) {
                if (currentPeriod) {
                  history.push(currentPeriod);
                }
                currentPeriod = {
                  _id: att._id,
                  site: siteObj,
                  siteId: siteId,
                  fromDate: att.date,
                  toDate: att.date,
                  active: false
                };
              } else {
                currentPeriod.toDate = att.date;
              }
            }
            if (currentPeriod) {
              currentPeriod.active = true;
              history.push(currentPeriod);
            }
            return history.reverse();
          })()
        };
      });
  
      setSiteLabours(filteredLaboursWithDates);
  
      const wageTotal =
        filteredLaboursWithDates.reduce(
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
  
      const today =
        new Date()
          .toISOString()
          .split("T")[0];
  
      const presentCount =
        siteAttendance.filter(
          (attendance) =>
            attendance.status === "Present" &&
            attendance.date?.split("T")[0] === today
        ).length;
  
      setTodayPresent(
        presentCount
      );

      const challanRes = await API.get(`/challans/site/${site._id}`);
      setSiteChallans(challanRes.data);
  
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

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">
              Site Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
              Manage, monitor, and audit construction and painting project sites.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary-premium flex items-center justify-center gap-2 text-sm"
          >
            <span>+ Add New Site</span>
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-16 text-center border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
            <FaBuilding className="text-slate-350 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No sites found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Add a new site to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site, index) => (
              <div
                key={site._id}
                style={{ "--stagger-delay": `${index * 25}ms` }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden group animate-slide-in-staggered"
              >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                    {site.name}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    📍 {site.location}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                    Contractor: <span className="font-semibold text-slate-800 dark:text-slate-250">{site.contractorName || "N/A"}</span>
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  site.status === "Active" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/50" 
                    : "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}>
                  {site.status || "Active"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5 text-xs">
                    <span className="font-medium text-slate-500 dark:text-slate-450">
                      Progress
                    </span>
                    <span className="font-bold text-slate-850 dark:text-slate-200 font-outfit">
                      {site.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-555"
                      style={{
                        width: `${site.progress}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Total Expenses:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold text-sm font-outfit">
                    ₹<AnimatedCounter value={allChallans
                      .filter((c) => {
                        const targetSiteName = site.name.toLowerCase().trim();
                        const targetSiteId = site._id.toString().toLowerCase();
                        if (c.sites && c.sites.length > 0) {
                          const hasNameMatch = c.sites.some((s) => s?.name?.toLowerCase().trim() === targetSiteName);
                          if (hasNameMatch) return true;
                          return c.sites.some((s) => {
                            const sid = s?._id || s;
                            return sid && sid.toString().toLowerCase() === targetSiteId;
                          });
                        }
                        const singleName = c.site?.name?.toLowerCase().trim();
                        if (singleName) {
                          return singleName === targetSiteName;
                        }
                        const singleId = c.site?._id || c.site;
                        return singleId && singleId.toString().toLowerCase() === targetSiteId;
                      })
                      .reduce((sum, c) => {
                        const targetSiteName = site.name.toLowerCase().trim();
                        const targetSiteId = site._id.toString().toLowerCase();
                        const filteredItems = (c.items || []).filter((item) => {
                          const itemName = item.site?.name?.toLowerCase().trim();
                          if (itemName) {
                            return itemName === targetSiteName;
                          }
                          const itemSiteId = item.site?._id || item.site;
                          return itemSiteId && itemSiteId.toString().toLowerCase() === targetSiteId;
                        });
                        const siteTotal = filteredItems.reduce((s, it) => s + (Number(it.amount) || 0), 0);
                        return sum + siteTotal;
                      }, 0)} />
                  </span>
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => viewSiteDetails(site)}
                    className="flex-1 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 px-2.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 text-center"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => setEditingSite(site)}
                    className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-755 dark:text-indigo-400 hover:bg-indigo-100/70 border border-indigo-100 dark:border-indigo-900/50 px-2.5 py-2 rounded-xl font-bold text-xs transition-all duration-200"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteSite(site._id)}
                    className="bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/70 border border-rose-100 dark:border-rose-900/50 px-2.5 py-2 rounded-xl font-bold text-xs transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* ADD SITE MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl animate-scale-in">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-outfit">
                Add New Site
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Site Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter site name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Progress %</label>
                  <input
                    type="number"
                    name="progress"
                    placeholder="0"
                    value={formData.progress}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Contractor Name</label>
                  <input
                    type="text"
                    name="contractorName"
                    placeholder="Enter contractor name"
                    value={formData.contractorName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createSite}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-755 text-white font-bold py-3 rounded-2xl text-sm transition-colors"
                  >
                    Save Site
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-2xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT SITE MODAL */}
        {editingSite && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl animate-scale-in">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-outfit">
                Edit Site
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Site Name</label>
                  <input
                    type="text"
                    value={editingSite.name}
                    onChange={(e) =>
                      setEditingSite({
                        ...editingSite,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={editingSite.location}
                    onChange={(e) =>
                      setEditingSite({
                        ...editingSite,
                        location: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Progress %</label>
                  <input
                    type="number"
                    value={editingSite.progress}
                    onChange={(e) =>
                      setEditingSite({
                        ...editingSite,
                        progress: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Contractor Name</label>
                  <input
                    type="text"
                    placeholder="Contractor Name"
                    value={editingSite.contractorName || ""}
                    onChange={(e) =>
                      setEditingSite({
                        ...editingSite,
                        contractorName: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
                  <select
                    value={editingSite.status}
                    onChange={(e) =>
                      setEditingSite({
                        ...editingSite,
                        status: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-250 transition-all duration-200"
                  >
                    <option>Active</option>
                    <option>Completed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={updateSite}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-755 text-white font-bold py-3 rounded-2xl text-sm transition-colors"
                  >
                    Update Site
                  </button>
                  <button
                    onClick={() => setEditingSite(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-2xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

               {/* DETAILED VIEW MODAL */}
        {selectedSite && (
          <div
            onClick={() => setSelectedSite(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 animate-fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden cursor-default"
            >
              
              <div className="border-b border-slate-150 dark:border-slate-800 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 bg-white dark:bg-slate-900 rounded-t-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">
                    {selectedSite.name}
                  </h2>
                  <p className="text-slate-550 dark:text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                    <span>📍 {selectedSite.location}</span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span>👷 Contractor: {selectedSite.contractorName || "N/A"}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all duration-200 font-bold shrink-0 active:scale-90"
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto p-6 md:p-8 space-y-8 flex-1">
                {/* Stats cards grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 border-l-4 border-l-blue-500 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-default">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                      Total Labourers
                    </p>
                    <h3 className="text-3xl font-extrabold text-slate-850 dark:text-blue-400 mt-2 font-outfit">
                      <AnimatedCounter value={siteLabours.length} formatter={(v) => v} />
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 border-l-4 border-l-emerald-500 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-default">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                      Present Today
                    </p>
                    <h3 className="text-3xl font-extrabold text-slate-855 dark:text-emerald-400 mt-2 font-outfit">
                      <AnimatedCounter value={todayPresent} formatter={(v) => v} />
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 border-l-4 border-l-indigo-500 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-default">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-455 uppercase tracking-wider">
                      Progress
                    </p>
                    <h3 className="text-3xl font-extrabold text-slate-850 dark:text-indigo-450 mt-2 font-outfit">
                      <AnimatedCounter value={selectedSite.progress} formatter={(v) => v} />%
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 border-l-4 border-l-purple-500 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-default">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                      Site Expenses
                    </p>
                    <h3 className="text-3xl font-extrabold text-slate-850 dark:text-purple-400 mt-2 font-outfit">
                      ₹<AnimatedCounter value={siteChallans.reduce((sum, c) => sum + getSiteSpecificChallanData(c).total, 0)} />
                    </h3>
                  </div>
                </div>

                {/* Working Labourers Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                      Working Labourers
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900/20 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">
                        <tr>
                          <th className="text-left px-6 py-3.5">Name</th>
                          <th className="text-left px-6 py-3.5">Phone</th>
                          <th className="text-left px-6 py-3.5">Daily Wage</th>
                          <th className="text-left px-6 py-3.5">Site Joined Date</th>
                          <th className="text-right px-6 py-3.5">History</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {siteLabours.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                              No labourers currently logged at this site.
                            </td>
                          </tr>
                        ) : (
                          siteLabours.map((labour) => (
                            <tr key={labour._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150">
                              <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white font-outfit text-sm">{labour.name}</td>
                              <td className="px-6 py-4.5 text-slate-600 dark:text-slate-350 text-sm font-medium">{labour.phone || "—"}</td>
                              <td className="px-6 py-4.5 text-sm">
                                <span className="badge-present">
                                  ₹{labour.dailyWage}/day
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-sm text-slate-500 font-medium">
                                {labour.siteAssignedDate
                                  ? new Date(labour.siteAssignedDate).toLocaleDateString("en-IN")
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4.5 text-right">
                                <button
                                  onClick={() => openHistory(labour)}
                                  className="bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-1 shadow-sm"
                                >
                                  <span>History</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Site Expenses / Challans Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">
                      Site Expenses / Challans
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {siteChallans.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                        No expenses or challans logged for this site yet.
                      </div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/20 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">
                          <tr>
                            <th className="text-left px-6 py-3.5">Challan No.</th>
                            <th className="text-left px-6 py-3.5">Date</th>
                            <th className="text-left px-6 py-3.5">Vendor</th>
                            <th className="text-right px-6 py-3.5">Total Items</th>
                            <th className="text-right px-6 py-3.5">Grand Total</th>
                            <th className="text-right px-6 py-3.5">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {siteChallans.map((challan) => {
                            const siteData = getSiteSpecificChallanData(challan);
                            return (
                              <tr key={challan._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150">
                                <td className="px-6 py-4.5 font-bold text-indigo-650 dark:text-indigo-400 text-sm">
                                  #{challan.challanNo}
                                </td>
                                <td className="px-6 py-4.5 text-sm text-slate-500 font-medium">
                                  {new Date(challan.billDate).toLocaleDateString("en-IN")}
                                </td>
                                <td className="px-6 py-4.5 font-bold text-slate-850 dark:text-white font-outfit text-sm">
                                  {challan.vendor}
                                </td>
                                <td className="px-6 py-4.5 text-right text-sm text-slate-600 dark:text-slate-350 font-medium">
                                  {siteData.items.length}
                                </td>
                                <td className="px-6 py-4.5 text-right font-extrabold text-slate-900 dark:text-white font-outfit text-base">
                                  ₹<AnimatedCounter value={siteData.total} />
                                </td>
                                <td className="px-6 py-4.5 text-right">
                                  <button
                                    onClick={() => setSelectedDetailChallan(challan)}
                                    className="bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-1 shadow-sm"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
     
      {/* HISTORY MODAL */}
      {showHistoryModal && selectedLabour && (
        <div
          onClick={() => setShowHistoryModal(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-xl animate-scale-in cursor-default"
          >
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                {selectedLabour.name} - Site Assignment History
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 w-8 h-8 rounded-full text-base flex items-center justify-center font-bold transition-all duration-205 active:scale-90"
              >
                ×
              </button>
            </div>

            <div className="border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/20 border-b border-slate-200/60 dark:border-slate-800 text-slate-550 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold font-outfit">
                  <tr>
                    <th className="p-4 text-left">Site</th>
                    <th className="p-4 text-left">From Date</th>
                    <th className="p-4 text-left">To Date</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-sm text-slate-700 dark:text-slate-300">
                  {selectedLabour.siteHistory?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">No assignment history found.</td>
                    </tr>
                  ) : (
                    selectedLabour.siteHistory?.map((history) => (
                      <tr key={history._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors duration-150">
                        <td className="p-4 font-bold text-slate-900 dark:text-white font-outfit">{history.site?.name}</td>
                        <td className="p-4 text-slate-500">{new Date(history.fromDate).toLocaleDateString("en-IN")}</td>
                        <td className="p-4 text-slate-500">
                          {history.toDate
                            ? new Date(history.toDate).toLocaleDateString("en-IN")
                            : "Present"}
                        </td>
                        <td className="p-4">
                          <span className={history.active ? "text-emerald-600 dark:text-emerald-450 font-bold" : "text-slate-500"}>
                            {history.active ? "Active" : "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHALLAN DETAIL SUMMARY MODAL */}
      {selectedDetailChallan && (
        <div
          onClick={() => setSelectedDetailChallan(null)}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in overflow-hidden cursor-default"
          >
            
            <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-200/60 dark:border-slate-850 flex justify-between items-center shrink-0 rounded-t-3xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-205 font-outfit">Challan Summary</h2>
              <button
                onClick={() => setSelectedDetailChallan(null)}
                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 w-8 h-8 rounded-full text-xl flex items-center justify-center transition-all duration-200 font-bold active:scale-90"
              >
                ×
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto text-slate-700 dark:text-slate-350">
              <div className="flex justify-between items-start border-b border-dashed border-slate-205 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white font-outfit">{selectedDetailChallan.vendor}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">Supplier / Vendor</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Challan No.:</p>
                  <p className="font-bold text-indigo-650 dark:text-indigo-400">#{selectedDetailChallan.challanNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Associated Sites</p>
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 mt-1 text-sm font-outfit">
                    {selectedDetailChallan.sites && selectedDetailChallan.sites.length > 0
                      ? selectedDetailChallan.sites.map((s) => s.name).join(", ")
                      : selectedDetailChallan.site?.name || selectedSite?.name || "N/A"}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Challan Date</p>
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 mt-1 text-sm font-outfit">
                    {new Date(selectedDetailChallan.billDate).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h4>
                </div>
              </div>

              <div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-550 text-xs font-bold text-left uppercase tracking-wider font-outfit">
                      <th className="pb-2.5 w-[45%] font-bold">PARTICULARS</th>
                      <th className="pb-2.5 w-[15%] text-center font-bold">LTR.</th>
                      <th className="pb-2.5 w-[10%] text-center font-bold">QTY.</th>
                      <th className="pb-2.5 w-[15%] text-right font-bold">RATE</th>
                      <th className="pb-2.5 w-[15%] text-right font-bold">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {getSiteSpecificChallanData(selectedDetailChallan).items.map((item, idx) => (
                      <tr key={idx} className="text-slate-600 dark:text-slate-400 text-sm">
                        <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{item.itemName}</td>
                        <td className="py-3 text-center text-slate-500">{item.liter || "-"}</td>
                        <td className="py-3 text-center font-semibold">{item.qty}</td>
                        <td className="py-3 text-right">₹{(item.rate || 0).toLocaleString("en-IN")}</td>
                        <td className="py-3 text-right font-bold text-slate-800 dark:text-white">
                          ₹{(item.amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 dark:border-slate-800 font-bold">
                      <td colSpan="3" className="py-4"></td>
                      <td className="py-4 text-right text-slate-500 dark:text-slate-400">TOTAL:</td>
                      <td className="py-4 text-right text-lg text-slate-900 dark:text-white font-black font-outfit">
                        ₹<AnimatedCounter value={getSiteSpecificChallanData(selectedDetailChallan).total} />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-850 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedDetailChallan(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-200 active:scale-95 text-sm shadow-md"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

    </MainLayout>

  );

};

export default Sites;
