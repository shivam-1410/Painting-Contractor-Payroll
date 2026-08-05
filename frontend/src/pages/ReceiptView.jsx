import {
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import API from "../services/api";

import ReceiptTemplate from "../components/ReceiptTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ReceiptView = () => {

  const { id } = useParams();

  const [receipt, setReceipt] =
    useState(null);

  const printRef = useRef();

  useEffect(() => {

    fetchReceipt();

  }, []);

  const fetchReceipt = async () => {

    try {

      const res = await API.get(
        "/receipt"
      );

      const foundReceipt =
        res.data.find(
          (item) =>
            item._id === id
        );
      console.log(foundReceipt);
      setReceipt(foundReceipt);

    } catch (error) {

      console.log(error);

    }

  };

  const handlePrint = async () => {
    const input = printRef.current;
    if (!input) return;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // exact proportional height

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${receipt.labourName || "Labour"}-Receipt.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-slate-700">
        Loading Receipt...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 flex flex-col items-center">
      <div className="fixed top-5 right-5 z-50 flex gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-lg font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>🖨️ Print</span>
        </button>
        <button
          onClick={handlePrint}
          className="bg-[#0b2c6f] hover:bg-[#082257] text-white px-6 py-2.5 rounded-xl shadow-lg font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>📥 Download PDF</span>
        </button>
      </div>

      <div className="flex justify-center w-full my-4 print:m-0 print:p-0">
        <div
          id="receipt-content"
          ref={printRef}
          style={{
            width: "210mm",
            margin: "0 auto",
            background: "white",
          }}
          className="shadow-xl rounded-[22px] print:shadow-none print:rounded-none overflow-hidden"
        >
          <ReceiptTemplate receipt={receipt} />
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;