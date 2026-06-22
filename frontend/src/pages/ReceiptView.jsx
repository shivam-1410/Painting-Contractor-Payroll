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
  
    const canvas = await html2canvas(input, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: input.scrollWidth,
      height: input.scrollHeight,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
    });
  
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    const pageWidth = 210;
    const pageHeight = 297;
  
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight
    );
  
    pdf.save(
      `${receipt.labourName}-Receipt.pdf`
    );
  };

  if (!receipt) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold">

        Loading Receipt...

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-white flex justify-center">

      <div className="fixed top-5 right-5 z-50">

        <button

          onClick={handlePrint}

          className="bg-blue-900 text-white px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-800 text-xl font-semibold"

        >

          Print / Download PDF

        </button>

      </div>

      <div className="flex justify-center">
  <div
    id="receipt-content"
    ref={printRef}
    style={{
      width: "794px",   // exact A4 width at 96dpi
      margin: "0 auto",
      background: "white",
    }}
  >
    <ReceiptTemplate receipt={receipt} />
  </div>
</div>

    </div>

  );

};

export default ReceiptView;