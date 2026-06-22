import { useEffect, useState } from "react";

import API from "../services/api";

const EditLabourModal = ({
  labour,
  closeModal,
  fetchLabours,
}) => {

  const [sites, setSites] = useState([]);

  const [formData, setFormData] = useState({

    name: labour?.name || "",

    phone: labour?.phone || "",

    assignedSite:
      labour?.assignedSite?._id || "",

    dailyWage:
      labour?.dailyWage || "",

    joiningDate:
      labour?.joiningDate
        ?.split("T")[0] || "",

  });

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

  const updateLabour = async () => {

    try {

      await API.put(

        `/labours/${labour._id}`,

        formData

      );

      fetchLabours();

      closeModal();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">

      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl">

        <div className="bg-gradient-to-r from-blue-950 to-slate-900 p-8 rounded-t-3xl text-white">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-4xl font-bold">

                Edit Labour

              </h2>

              <p className="text-slate-300 mt-2">

                Update labour details and site assignment

              </p>

            </div>

            <button
              onClick={closeModal}
              className="bg-white/20 hover:bg-white/30 w-12 h-12 rounded-full text-2xl transition-all duration-300"
            >

              ×

            </button>

          </div>

        </div>

        <div className="p-8 space-y-6">

          <div>

            <label className="block text-slate-700 font-semibold mb-2">

              Labour Name

            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter labour name"
            />

          </div>

          <div>

            <label className="block text-slate-700 font-semibold mb-2">

              Phone Number

            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter phone number"
            />

          </div>

          <div>

            <label className="block text-slate-700 font-semibold mb-2">

              Assigned Site

            </label>

            <select
              name="assignedSite"
              value={formData.assignedSite}
              onChange={handleChange}
              className="w-full border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
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

          </div>

          <div>

            <label className="block text-slate-700 font-semibold mb-2">

              Daily Wage

            </label>

            <input
              type="number"
              name="dailyWage"
              value={formData.dailyWage}
              onChange={handleChange}
              className="w-full border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter daily wage"
            />

          </div>

          <div>

            <label className="block text-slate-700 font-semibold mb-2">

              Joining Date

            </label>

            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

          </div>

          <div className="flex gap-4 pt-4">

            <button
              onClick={updateLabour}
              className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition-all duration-300"
            >

              Update Labour

            </button>

            <button
              onClick={closeModal}
              className="flex-1 bg-slate-200 hover:bg-slate-300 py-4 rounded-2xl font-semibold transition-all duration-300"
            >

              Cancel

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default EditLabourModal;