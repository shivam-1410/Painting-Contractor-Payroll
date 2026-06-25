import MainLayout from "../layouts/MainLayout";

import { useEffect, useState } from "react";

import API from "../services/api";

import ReceiptTemplate from "../components/ReceiptTemplate";
import { FaWhatsapp, FaFileInvoice } from "react-icons/fa";
import { toast } from "react-hot-toast";
import AnimatedCounter from "../components/AnimatedCounter";

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
    
        toast.error("Phone number not available", {
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        });
    
        return;
      }
    
      const message = `Hello ${receipt.labourName},
    
    Your salary has been processed.
    
    Site: ${receipt.siteName}
    
    Month: ${receipt.month}
    
    Total Salary: ₹${receipt.totalSalary}
    
    Receipt:
    https://vcdreams.vercel.app/receipt/${receipt._id}
    
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

      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-outfit">

              Salary Receipts

            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">

              Generate, view, and share processed monthly labour salary receipts.

            </p>

          </div>

        </div>

        {receipts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-16 text-center border border-slate-200/60 dark:border-slate-800/80 animate-fade-in">
            <FaFileInvoice className="text-slate-350 dark:text-slate-600 text-6xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-outfit">No receipts found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Salary receipts will show up here after payroll processing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {receipts.map((receipt, index) => (
              
              <div
                key={receipt._id}
                style={{ "--stagger-delay": `${index * 25}ms` }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden group animate-slide-in-staggered"
              >

              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

              <div className="flex items-start justify-between mb-4">

                <div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">

                    {receipt.labourName}

                  </h2>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">

                    Site: <span className="font-semibold text-slate-800 dark:text-slate-250">{receipt.siteName}</span>

                  </p>

                </div>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-800/50">

                  Paid

                </span>

              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">

                <div className="flex justify-between text-xs">

                  <span className="text-slate-400 dark:text-slate-500 font-medium">

                    Daily Wage

                  </span>

                  <span className="font-semibold text-slate-800 dark:text-slate-200">

                    ₹<AnimatedCounter value={receipt.dailyWage} />

                  </span>

                </div>

                <div className="flex justify-between text-xs">

                  <span className="text-slate-400 dark:text-slate-500 font-medium">

                    Month

                  </span>

                  <span className="font-semibold text-slate-800 dark:text-slate-200">

                    {receipt.month}

                  </span>

                </div>

                <div className="flex justify-between items-center text-xs font-semibold bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850 mt-1">

                  <span className="text-slate-400 dark:text-slate-505 font-medium">

                    Total Paid:

                  </span>

                  <span className="text-emerald-600 dark:text-emerald-450 font-bold text-sm font-outfit">

                    ₹<AnimatedCounter value={receipt.totalSalary} />

                  </span>

                </div>

              </div>
              

              <div className="flex gap-2 mt-5">

                <button
                  onClick={() => {
                    window.open(
                      `/receipt/${receipt._id}`,
                      "_blank"
                    );
                  }}
                  className="flex-1 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-955 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 px-2.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 text-center"
                >

                  View Receipt

                </button>

                <button
                  onClick={() =>
                    sendWhatsApp(receipt)
                  }
                  className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 px-3 py-2 rounded-xl font-bold text-sm transition-all border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0"
                  title="Send WhatsApp Receipt"
                >

                  <FaWhatsapp className="text-base" />

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
        )}

      </div>

    </MainLayout>

  );

};

export default Receipts;