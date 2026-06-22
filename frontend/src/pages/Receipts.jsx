import MainLayout from "../layouts/MainLayout";

import { useEffect, useState } from "react";

import API from "../services/api";

import ReceiptTemplate from "../components/ReceiptTemplate";
import { FaWhatsapp } from "react-icons/fa";
const Receipts = () => {

  const [receipts, setReceipts] =
    useState([]);

  useEffect(() => {

    fetchReceipts();

  }, []);

  const fetchReceipts = async () => {

    try {

      const res = await API.get(
        "/receipt"
      );

      setReceipts(res.data);

    } catch (error) {

      console.log(error);

    }

  };
  const sendWhatsApp = (receipt) => {

      if (!receipt.phone) {
    
        alert(
          "Phone number not available"
        );
    
        return;
      }
    
      const message = `Hello ${receipt.labourName},
    
    Your salary has been processed.
    
    Site: ${receipt.siteName}
    
    Month: ${receipt.month}
    
    Total Salary: ₹${receipt.totalSalary}
    
    Receipt:
    ${window.location.origin}/receipt/${receipt._id}
    
    - VC Dreams`;
    
      window.open(
        `https://wa.me/91${receipt.phone}?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
  };

  return (

    <MainLayout>

      <div>

        <div className="mb-10">

          <h1 className="text-5xl font-extrabold text-slate-800">

            Salary Receipts

          </h1>

          <p className="text-slate-500 mt-3 text-lg">

            Generate and manage labour salary receipts

          </p>

        </div>

        <div className="grid grid-cols-3 gap-8">

          {receipts.map((receipt) => (
            
            <div
              key={receipt._id}
              className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 hover:scale-105 transition-all duration-300"
            >

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-2xl font-bold text-slate-800">

                    {receipt.labourName}

                  </h2>

                  <p className="text-slate-500 mt-2">

                    {receipt.siteName}

                  </p>

                </div>

                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">

                  Paid

                </span>

              </div>

              <div className="space-y-4">

                <div className="flex justify-between">

                  <span className="text-slate-500">

                    Daily Wage

                  </span>

                  <span className="font-bold">

                    ₹{receipt.dailyWage}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">

                    Month

                  </span>

                  <span className="font-bold">

                    {receipt.month}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-500">

                    Total Salary

                  </span>

                  <span className="font-bold text-green-600 text-xl">

                    ₹{receipt.totalSalary}

                  </span>

                </div>

              </div>
              

              <div className="flex gap-3 mt-8">

  <button

    onClick={() => {

      window.open(
        `/receipt/${receipt._id}`,
        "_blank"
      );

    }}

    className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition-all duration-300"
  >

    View Receipt

  </button>

  <button

    onClick={() =>
      sendWhatsApp(receipt)
    }

    className="bg-green-500 hover:bg-green-600 text-white px-5 rounded-2xl shadow-lg transition-all duration-300"
  >

    <FaWhatsapp className="text-2xl" />

  </button>

</div>

              <div
                id={`receipt-${receipt._id}`}
                className="hidden print:block"
              >

                <ReceiptTemplate
                  receipt={receipt}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

    </MainLayout>

  );

};

export default Receipts;