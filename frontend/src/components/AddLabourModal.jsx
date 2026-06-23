import { useEffect, useState } from "react";

import API from "../services/api";

const AddLabourModal = ({
  closeModal,
  fetchLabours,
}) => {

  const [formData, setFormData] = useState({

    name: "",

    phone: "",

    dailyWage: "",

    joiningDate: "",

  });

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };

  const saveLabour = async () => {

    try {

      await API.post("/labours", formData);

      fetchLabours();

      closeModal();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl">

        <h2 className="text-3xl font-bold text-slate-800 mb-8">

          Add Labour

        </h2>

        <div className="space-y-5">

          <input
            type="text"
            name="name"
            placeholder="Labour Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-4 rounded-2xl"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-4 rounded-2xl"
          />



          <input
            type="number"
            name="dailyWage"
            placeholder="Daily Wage"
            value={formData.dailyWage}
            onChange={handleChange}
            className="w-full border p-4 rounded-2xl"
          />

          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            className="w-full border p-4 rounded-2xl"
          />

          <div className="flex gap-4 pt-4">

            <button
              onClick={saveLabour}
              className="bg-blue-900 text-white px-6 py-3 rounded-2xl hover:bg-blue-800"
            >

              Save Labour

            </button>

            <button
              onClick={closeModal}
              className="bg-slate-200 px-6 py-3 rounded-2xl"
            >

              Cancel

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default AddLabourModal;