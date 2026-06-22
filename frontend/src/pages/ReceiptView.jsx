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

      setReceipt(foundReceipt);

    } catch (error) {

      console.log(error);

    }

  };

  const handlePrint = () => {

    const printContents =
      printRef.current.innerHTML;

    const printWindow =
      window.open(
        "",
        "",
        "width=1200,height=900"
      );

    printWindow.document.write(`

      <html>

        <head>

          <title>
            Receipt
          </title>

          <script src="https://cdn.tailwindcss.com"></script>

          <style>

            body {

              margin: 0;

              padding: 0;

              background: white;

            }

            @media print {

              body {

                -webkit-print-color-adjust: exact;

              }

            }

          </style>

        </head>

        <body>

          ${printContents}

        </body>

      </html>

    `);

    printWindow.document.close();

    printWindow.onload = () => {

      printWindow.focus();

      printWindow.print();

    };

  };

  if (!receipt) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold">

        Loading Receipt...

      </div>

    );

  }

  return (

    <div className="bg-slate-100 min-h-screen">

      <div className="fixed top-5 right-5 z-50">

        <button

          onClick={handlePrint}

          className="bg-blue-900 text-white px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-800 text-xl font-semibold"

        >

          Print / Download PDF

        </button>

      </div>

      <div ref={printRef}>

        <ReceiptTemplate
          receipt={receipt}
        />

      </div>

    </div>

  );

};

export default ReceiptView;