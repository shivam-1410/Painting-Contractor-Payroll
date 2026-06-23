const ReceiptTemplate = ({
  receipt,
}) => {

  return (

      <div
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: 0,
          padding: 0,
          background: "white",
        }}
      >

      <div
        className="bg-white rounded-[22px] border border-slate-300 overflow-hidden"
        style={{

          width: "210mm",

          minHeight: "297mm",

        }}
      >

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row border-b border-slate-300">

          {/* LEFT LOGO */}

          <div className="w-[220px] flex flex-col items-center justify-center p-6 border-r border-slate-300">

          <img
            src="/Logo.png"
            alt="VC Dreams Logo"
            className="w-[150px] h-auto object-contain"
          />
            
            <h1 className="text-[30px] font-black text-[#0b2c6f] leading-none mt-2 tracking-tight text-center">

              VC DREAMS

            </h1>

            <div className="w-full flex items-center gap-2 mt-3">

              <div className="h-[2px] bg-[#0b2c6f] flex-1"></div>

              <p className="text-[#0b2c6f] font-semibold tracking-wide text-[10px] whitespace-nowrap">

                PAINTING CONTRACTOR

              </p>

              <div className="h-[2px] bg-[#0b2c6f] flex-1"></div>

            </div>

          </div>

          {/* RIGHT HEADER */}

          <div className="flex-1 p-6">

            <div className="flex justify-between items-start">

              <div>

                <h1 className="text-[34px] font-black text-[#0b2c6f] tracking-tight leading-none">

                  LABOUR SALARY RECEIPT

                </h1>

                <p className="text-[15px] text-slate-500 mt-2">

                  Professional Payroll Management System

                </p>

                <div className="w-[70px] h-[4px] rounded-full bg-[#0b2c6f] mt-3"></div>

              </div>

              <div className="w-[60px] h-[60px] rounded-[12px] bg-[#0b2c6f] flex items-center justify-center text-white text-[28px]">

                📅

              </div>

            </div>

            <div className="flex justify-between mt-6 gap-8">

              {/* COMPANY */}

              <div>

                <h2 className="text-[18px] font-bold text-slate-800">

                  VC Dreams Painting Contractor

                </h2>

                <div className="space-y-2 mt-3 text-[13px] text-slate-600">

                  <p>

                    📍 A/6, Rajvi Resi,
                    Jahangirpura, Surat

                  </p>

                  <p>

                    📞 +91 98982 57766

                  </p>

                  <p>

                    ✉️ viralpatel57766@gmail.com

                  </p>

                </div>

              </div>

              {/* RECEIPT INFO */}

              <div className="space-y-3 text-[13px]">

                <div className="flex gap-3">

                  <span className="text-slate-500">

                    Receipt No.

                  </span>

                  <span className="font-bold">

                    VC/REC/{receipt._id?.slice(-6).toUpperCase()}

                  </span>

                </div>

                <div className="flex gap-3">

                  <span className="text-slate-500">

                    Generated On

                  </span>

                  <span className="font-bold">

                    {
                      new Date().toLocaleDateString()
                    }

                  </span>

                </div>

                <div className="flex gap-3">

                  <span className="text-slate-500">

                    For Month

                  </span>

                  <span className="font-black text-[#0b2c6f]">

                    {receipt.month}

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* LABOUR DETAILS */}

        <div className="m-5 border border-slate-300 rounded-[18px] overflow-hidden">

          <div className="bg-[#0b2c6f] text-white px-5 py-3 flex items-center gap-3">

            <div className="w-[35px] h-[35px] rounded-full bg-white text-[#0b2c6f] flex items-center justify-center text-[18px]">

              👤

            </div>

            <h2 className="text-[18px] font-black">

              LABOUR DETAILS

            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-8 text-[13px]">

            <div className="space-y-5">

              <div className="flex justify-between">

                <span className="text-slate-500">

                  Labour Name

                </span>

                <span className="font-bold">

                  {receipt.labourName}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">

                  Assigned Site

                </span>

                <span className="font-bold">

                  {receipt.siteName}

                </span>

              </div>

            </div>

            <div className="space-y-5">

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

                  Total Working Days

                </span>

                <span className="font-bold">

                  {
                  receipt.presentDays +
                  receipt.halfDays +
                  receipt.nightShift
                  }

                </span>

              </div>

            </div>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-5">

          {/* ATTENDANCE */}

          <div className="border border-slate-300 rounded-[18px] overflow-hidden">

            <div className="bg-[#0b2c6f] text-white p-4 text-[18px] font-black">

              ATTENDANCE SUMMARY

            </div>

            <div className="p-5 space-y-5 text-[14px]">

              <div className="flex justify-between">

                <span>

                  ☀️ Present Days

                </span>

                <span className="font-black text-blue-700">

                {receipt.presentDays}

                </span>

              </div>

              <div className="flex justify-between">

                <span>

                  🌤 Half Days

                </span>

                <span className="font-black text-orange-500">

                {receipt.halfDays}

                </span>

              </div>

              <div className="flex justify-between">

                <span>

                  🌙 Night Work

                </span>

                <span className="font-black text-purple-700">

                {receipt.nightShift}

                </span>

              </div>

              <div className="flex justify-between border-t pt-4">

                <span className="font-black">

                  Total Days

                </span>

                <span className="font-black text-[#0b2c6f]">

                  {
                  receipt.presentDays +
                  receipt.halfDays +
                  receipt.nightShift
                  }

                </span>

              </div>

            </div>

          </div>

          {/* EARNINGS */}

          <div className="border border-slate-300 rounded-[18px] overflow-hidden">

            <div className="bg-[#0b2c6f] text-white p-4 text-[18px] font-black">

              EARNINGS & DEDUCTIONS

            </div>

            <table className="w-full text-[13px]">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-3 text-left">

                    DESCRIPTION

                  </th>

                  <th className="p-3 text-right">

                    AMOUNT

                  </th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-b">

                  <td className="p-3">

                    Base Salary

                  </td>

                  <td className="p-3 text-right text-blue-700 font-bold">

                    ₹{receipt.totalSalary}

                  </td>

                </tr>

                <tr className="border-b">

                  <td className="p-3">

                    Tea Expense

                  </td>

                  <td className="p-3 text-right text-orange-500 font-bold">

                    ₹150

                  </td>

                </tr>

                <tr className="border-b">

                  <td className="p-3">

                    Travel Expense (Bhada)

                  </td>

                  <td className="p-3 text-right text-orange-500 font-bold">

                    ₹450

                  </td>

                </tr>

                <tr>

                  <td className="p-3 font-black text-[18px]">

                    NET PAYABLE

                  </td>

                  <td className="p-3 text-right text-green-600 font-black text-[24px]">

                    ₹{receipt.totalSalary}

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

        {/* SIGNATURES */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 mt-5">

          <div className="text-center">

            <div className="text-[42px]">

              ✍️

            </div>

            <div className="border-t-2 border-black mt-3 pt-3 text-[15px] font-bold">

              Employee Signature

            </div>

          </div>

          <div className="flex flex-col items-center justify-center">

            <div className="w-[90px] h-[90px] border-4 border-black flex items-center justify-center text-[16px] font-bold">

              QR

            </div>

            <p className="text-[12px] mt-2">

              Scan for verification

            </p>

          </div>

          <div className="text-center">

            <div className="text-[42px]">

              ✍️

            </div>

            <div className="border-t-2 border-black mt-3 pt-3 text-[15px] font-bold">

              Authorized Signature

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="bg-[#0b2c6f] text-white py-4 text-center text-[13px] font-medium">

          This is a computer generated receipt and does not require physical signature.

        </div>

      </div>

    </div>

  );

};

export default ReceiptTemplate;