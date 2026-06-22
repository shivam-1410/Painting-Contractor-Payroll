import MainLayout from "../layouts/MainLayout";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import API from "../services/api";
import AddLabourModal from "../components/AddLabourModal";
import EditLabourModal from "../components/EditLabourModal";

const Labours = () => {
  const [labours, setLabours] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLabour, setEditLabour] = useState(null);

  useEffect(() => {
    fetchLabours();
  }, []);

  const fetchLabours = async () => {
    try {
      const res = await API.get("/labours");
      setLabours(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteLabour = async (id) => {
    try {
      await API.delete(`/labours/${id}`);
      fetchLabours();
    } catch (error) {
      console.log(error);
    }
  };

  const openEditModal = (labour) => {
    setEditLabour(labour);
    setShowEditModal(true);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-950">
            Labour Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage all labour workers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-md"
        >
          <FaPlus />
          Add Labour
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-950 text-white">
            <tr>
              <th className="text-left p-5">
                Labour Name
              </th>

              <th className="text-left p-5">
                Phone
              </th>

              <th className="text-left p-5">
                Site
              </th>

              <th className="text-left p-5">
                Daily Wage
              </th>

              <th className="text-left p-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {labours.map((labour) => (
              <tr
                key={labour._id}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-5 font-semibold">
                  {labour.name}
                </td>

                <td className="p-5">
                  {labour.phone}
                </td>

                <td className="p-5">
                  {labour.assignedSite?.name || "Not Assigned"}
                </td>

                <td className="p-5 font-bold text-green-600">
                  ₹{labour.dailyWage}
                </td>

                <td className="p-5">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(labour)}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteLabour(labour._id)}
                      className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddLabourModal
          closeModal={() => setShowModal(false)}
          fetchLabours={fetchLabours}
        />
      )}

      {showEditModal && (
        <EditLabourModal
          labour={editLabour}
          closeModal={() => setShowEditModal(false)}
          fetchLabours={fetchLabours}
        />
      )}
    </MainLayout>
  );
};

export default Labours;