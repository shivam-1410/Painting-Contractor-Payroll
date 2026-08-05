import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  Users,
  Coins,
  Receipt,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Briefcase,
  X,
  CreditCard,
  UserCheck,
  MapPin,
  Clock,
  Sparkles,
  Info,
  Printer,
  Download
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import { formatDate } from "../utils/dateFormatter";
import AnimatedCounter from "../components/AnimatedCounter";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SitePayroll = () => {
  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearsList = ["2025", "2026", "2027"];

  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("labour");

  // Date filters
  const dateObj = new Date();
  const [selectedMonth, setSelectedMonth] = useState(monthsList[dateObj.getUTCMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(dateObj.getUTCFullYear()));
  const [isTillDate, setIsTillDate] = useState(false);

  // Detailed site data
  const [attendance, setAttendance] = useState([]);
  const [challans, setChallans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  // Modals & Loaders
  const [showTxModal, setShowTxModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Transaction Form State
  const [txForm, setTxForm] = useState({
    type: "Payment Received",
    amount: "",
    partyName: "",
    reference: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await API.get("/sites");
      const activeSites = res.data.filter(s => s.status !== "Deleted");
      setSites(activeSites);
      if (activeSites.length > 0) {
        setSelectedSite(activeSites[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSite) {
      fetchSiteDetails(selectedSite._id);
    }
  }, [selectedSite]);

  const fetchSiteDetails = async (siteId) => {
    try {
      const [attRes, challanRes, txRes, payrollRes] = await Promise.all([
        API.get(`/reports/attendance?site=${siteId}`),
        API.get(`/challans/site/${siteId}`),
        API.get(`/site-transactions/site/${siteId}`),
        API.get("/payroll")
      ]);

      // Filter attendance records for this site
      const siteAtt = attRes.data || [];
      setAttendance(siteAtt);

      // Filter challans for this site
      const siteChallans = challanRes.data || [];
      setChallans(siteChallans);

      setTransactions(txRes.data || []);
      setPayrolls(payrollRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details for this site.");
    }
  };

  // Monthly filtered datasets
  const getFilteredAttendance = () => {
    if (isTillDate) return attendance;
    return attendance.filter(r => {
      const d = new Date(r.date);
      const m = monthsList[d.getUTCMonth()];
      const y = String(d.getUTCFullYear());
      return m === selectedMonth && y === selectedYear;
    });
  };

  const getFilteredChallans = () => {
    if (isTillDate) return challans;
    return challans.filter(c => {
      const d = new Date(c.billDate);
      const m = monthsList[d.getUTCMonth()];
      const y = String(d.getUTCFullYear());
      return m === selectedMonth && y === selectedYear;
    });
  };

  const getFilteredTransactions = () => {
    if (isTillDate) return transactions;
    return transactions.filter(t => {
      const d = new Date(t.date);
      const m = monthsList[d.getUTCMonth()];
      const y = String(d.getUTCFullYear());
      return m === selectedMonth && y === selectedYear;
    });
  };

  const filteredAttendance = getFilteredAttendance();
  const filteredChallans = getFilteredChallans();
  const filteredTransactions = getFilteredTransactions();

  // Group attendance by worker to show individual worker totals
  const getLabourPayroll = () => {
    const map = {};
    filteredAttendance.forEach(r => {
      if (!r.labour) return; // Skip deleted workers in active payroll wages table

      const workerId = r.labour._id;
      const name = r.labour.name;
      const dailyWage = r.labour.dailyWage || 0;

      if (!map[workerId]) {
        map[workerId] = {
          id: workerId,
          name,
          dailyWage,
          presentDays: 0,
          halfDays: 0,
          overtime: 0,
          teaExpense: 0,
          bhada: 0,
          advance: 0
        };
      }

      if (r.status === "Present") {
        map[workerId].presentDays++;
      } else if (r.status === "Half Day") {
        map[workerId].halfDays++;
      }
      map[workerId].overtime += r.overtime || r.nightShift || 0;
      map[workerId].teaExpense += r.teaExpense || 0;
      map[workerId].bhada += r.bhada || 0;
      map[workerId].advance += r.advance || 0;
    });

    return Object.values(map).map(w => {
      // Overtime calculation: hourly (wage / 8) * hours
      const otWage = w.overtime * (w.dailyWage / 8);
      const grossWage = (w.presentDays * w.dailyWage) + (w.halfDays * (w.dailyWage / 2)) + otWage + w.teaExpense + w.bhada;
      
      // Lookup payroll status for this worker, month and year
      const workerPayroll = payrolls.find(p => 
        p.labour?._id === w.id && 
        p.month === selectedMonth && 
        p.year === Number(selectedYear)
      );

      return {
        ...w,
        grossWage,
        netWage: grossWage - w.advance,
        paymentStatus: workerPayroll ? workerPayroll.paymentStatus : "Unscheduled"
      };
    });
  };

  const labourPayroll = getLabourPayroll();

  // Aggregate stats based on active month filters
  const totalLabourCost = labourPayroll.reduce((sum, w) => sum + w.grossWage, 0);
  const totalVendorCost = filteredChallans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalPaymentsReceived = filteredTransactions
    .filter(t => t.type === "Payment Received")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const siteBalance = totalPaymentsReceived - totalLabourCost - totalVendorCost;

  // Filtered Sites list
  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contractorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.partyName) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      const payload = {
        ...txForm,
        site: selectedSite._id,
        amount: Number(txForm.amount)
      };
      await API.post("/site-transactions", payload);
      toast.success("Transaction logged successfully!");
      setShowTxModal(false);
      // Reset form
      setTxForm({
        type: "Payment Received",
        amount: "",
        partyName: "",
        reference: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });
      fetchSiteDetails(selectedSite._id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save transaction.");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction record?")) {
      try {
        await API.delete(`/site-transactions/${id}`);
        toast.success("Transaction deleted successfully");
        fetchSiteDetails(selectedSite._id);
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete transaction.");
      }
    }
  };

  const handlePrintReceipt = (tx) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to print receipt.");
      return;
    }
    
    const receiptHTML = `
      <html>
        <head>
          <title>Payment Receipt - ${tx.partyName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Outfit:wght@500;700;800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background-color: #f8fafc;
              color: #1e293b;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-card {
              background: white;
              width: 100%;
              max-width: 600px;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              padding: 40px;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 24px;
              margin-bottom: 30px;
            }
            .logo-area h1 {
              font-family: 'Outfit', sans-serif;
              font-size: 26px;
              font-weight: 800;
              color: #0b2c6f;
              margin: 0;
              letter-spacing: -0.5px;
            }
            .logo-area p {
              font-size: 10px;
              color: #64748b;
              margin: 4px 0 0 0;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            .receipt-title {
              text-align: right;
            }
            .receipt-title h2 {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              letter-spacing: 0.5px;
            }
            .receipt-title p {
              font-size: 11px;
              color: #64748b;
              margin: 4px 0 0 0;
              font-family: monospace;
              font-weight: 600;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-bottom: 30px;
            }
            .detail-item label {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #94a3b8;
              letter-spacing: 0.8px;
              display: block;
              margin-bottom: 6px;
            }
            .detail-item span {
              font-size: 13.5px;
              font-weight: 600;
              color: #334155;
              display: block;
            }
            .amount-section {
              background: #f8fafc;
              border: 1px dashed #cbd5e1;
              border-radius: 20px;
              padding: 24px;
              text-align: center;
              margin-bottom: 30px;
              position: relative;
            }
            .amount-label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              margin-bottom: 8px;
            }
            .amount-val {
              font-family: 'Outfit', sans-serif;
              font-size: 36px;
              font-weight: 800;
              color: #10b981;
            }
            .stamp-container {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-12deg);
              opacity: 0.08;
              pointer-events: none;
            }
            .paid-stamp {
              border: 8px double #ef4444;
              border-radius: 16px;
              color: #ef4444;
              font-family: 'Outfit', sans-serif;
              font-size: 56px;
              font-weight: 800;
              padding: 10px 30px;
              text-transform: uppercase;
              letter-spacing: 6px;
              display: inline-block;
            }
            .paid-stamp-badge {
              position: absolute;
              bottom: 40px;
              right: 40px;
              border: 4px double #10b981;
              border-radius: 8px;
              color: #10b981;
              font-family: 'Outfit', sans-serif;
              font-size: 26px;
              font-weight: 800;
              padding: 6px 18px;
              text-transform: uppercase;
              letter-spacing: 3px;
              transform: rotate(-15deg);
              opacity: 0.85;
              background: rgba(255, 255, 255, 0.95);
              box-shadow: 0 4px 10px rgba(0,0,0,0.03);
            }
            .footer {
              border-top: 1px solid #f1f5f9;
              padding-top: 24px;
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .sig-block {
              text-align: right;
            }
            .sig-line {
              width: 140px;
              border-bottom: 1.5px solid #94a3b8;
              margin-bottom: 8px;
              display: inline-block;
            }
            .sig-text {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .note {
              font-size: 10px;
              color: #64748b;
              line-height: 1.6;
              max-width: 320px;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .receipt-card {
                border: none;
                box-shadow: none;
                padding: 20px;
              }
              .paid-stamp-badge {
                background: transparent !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="logo-area">
                <h1>VC DREAMS</h1>
                <p>Painting Contractor & ERP</p>
              </div>
              <div class="receipt-title">
                <h2>PAYMENT RECEIPT</h2>
                <p>No: ${tx._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            
            <div class="details-grid">
              <div class="detail-item">
                <label>Received From</label>
                <span>${tx.partyName || "N/A"}</span>
              </div>
              <div class="detail-item">
                <label>Date</label>
                <span>${formatDate(tx.date)}</span>
              </div>
              <div class="detail-item">
                <label>Payment Reference</label>
                <span>${tx.reference || "N/A"}</span>
              </div>
              <div class="detail-item">
                <label>Description</label>
                <span>${tx.description || "Payment received for site services"}</span>
              </div>
            </div>
            
            <div class="amount-section">
              <div class="stamp-container">
                <div class="paid-stamp">PAID</div>
              </div>
              <div class="amount-label">Amount Received</div>
              <div class="amount-val">₹ ${Number(tx.amount || 0).toLocaleString('en-IN')}.00</div>
            </div>
            
            <div class="paid-stamp-badge">PAID</div>
            
            <div class="footer">
              <div class="note">
                Thank you for your business. This is an official computer-generated receipt for the payments received by VC Dreams.
              </div>
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-text">Authorized Signatory</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const handleToggleChallanStatus = async (challanId, currentStatus) => {
    const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
    try {
      await API.patch(`/challans/${challanId}/status`, { paymentStatus: newStatus });
      toast.success(`Challan marked as ${newStatus}`);
      fetchSiteDetails(selectedSite._id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update challan status");
    }
  };

  const handleExportOverallPDF = () => {
    if (!selectedSite) {
      toast.error("No site selected.");
      return;
    }

    try {
      const doc = new jsPDF();
      const periodText = isTillDate ? "Overall (Till Date)" : `${selectedMonth} ${selectedYear}`;

      // --- COMPANY & REPORT HEADER ---
      doc.setFillColor(11, 44, 111);
      doc.rect(0, 0, 210, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.text("VC DREAMS - PAINTING CONTRACTOR", 14, 15);

      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text("SITE OVERALL FINANCIAL & PAYROLL REPORT", 14, 22);
      doc.setFontSize(8);
      doc.text(`Generated Date: ${new Date().toLocaleString("en-IN")}`, 14, 29);

      // --- SITE & CONTRACTOR METADATA BOX ---
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 43, 182, 32, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 43, 182, 32, "S");

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "bold");
      doc.text(`Project Site: ${selectedSite.name}`, 18, 51);
      doc.text(`Contractor Name: ${selectedSite.contractorName || "N/A"}`, 18, 59);
      doc.text(`Month / Period: ${periodText}`, 18, 67);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Location: ${selectedSite.location || "N/A"}`, 120, 51);
      doc.text(`Status: ${selectedSite.status || "Active"}`, 120, 59);
      doc.text(`Report ID: VCD-SITE-${selectedSite._id.slice(-6).toUpperCase()}`, 120, 67);

      // --- FINANCIAL METRICS SUMMARY ---
      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.text("Financial Summary Overview", 14, 83);

      autoTable(doc, {
        startY: 86,
        head: [["Labour Cost", "Material Bills", "Payments Received", "Net Site Balance"]],
        body: [[
          `INR ${totalLabourCost.toLocaleString("en-IN")}`,
          `INR ${totalVendorCost.toLocaleString("en-IN")}`,
          `INR ${totalPaymentsReceived.toLocaleString("en-IN")}`,
          `INR ${siteBalance.toLocaleString("en-IN")}`
        ]],
        theme: "grid",
        headStyles: { fillColor: [11, 44, 111], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, halign: "center" },
        bodyStyles: { fontSize: 9, fontStyle: "bold", halign: "center" },
        columnStyles: {
          3: { textColor: siteBalance >= 0 ? [16, 185, 129] : [225, 29, 72] }
        }
      });

      let currentY = (doc.lastAutoTable?.finalY || 105) + 10;

      // --- 1. LABOUR WAGES TABLE ---
      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("1. Labour Wages Summary", 14, currentY);

      const labourHeaders = [["Worker Name", "Daily Rate", "Presents", "Half Days", "OT (Hrs)", "Tea/Bhada", "Advance", "Status", "Total Cost"]];
      const labourRows = labourPayroll.map(w => [
        w.name,
        `INR ${w.dailyWage}`,
        w.presentDays,
        w.halfDays,
        `${w.overtime}h`,
        `INR ${w.teaExpense + w.bhada}`,
        `INR ${w.advance || 0}`,
        w.paymentStatus,
        `INR ${w.grossWage.toLocaleString("en-IN")}`
      ]);

      if (labourPayroll.length > 0) {
        labourRows.push([
          "TOTAL",
          "-",
          labourPayroll.reduce((s, w) => s + w.presentDays, 0),
          labourPayroll.reduce((s, w) => s + w.halfDays, 0),
          `${labourPayroll.reduce((s, w) => s + w.overtime, 0)}h`,
          `INR ${labourPayroll.reduce((s, w) => s + (w.teaExpense + w.bhada), 0)}`,
          `INR ${labourPayroll.reduce((s, w) => s + w.advance, 0)}`,
          "-",
          `INR ${totalLabourCost.toLocaleString("en-IN")}`
        ]);
      }

      autoTable(doc, {
        startY: currentY + 3,
        head: labourHeaders,
        body: labourRows.length > 0 ? labourRows : [["No labour records found", "", "", "", "", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        didParseCell: (data) => {
          if (data.row.index === labourRows.length - 1 && labourRows.length > 0 && data.section === "body") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [241, 245, 249];
          }
        }
      });

      currentY = (doc.lastAutoTable?.finalY || currentY + 20) + 10;

      // --- 2. MATERIAL BILLS TABLE ---
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("2. Material Bills (Challans)", 14, currentY);

      const challanHeaders = [["Challan No", "Date", "Vendor", "Items Summary", "Status", "Amount"]];
      const challanRows = filteredChallans.map(c => [
        c.challanNo,
        formatDate(c.billDate),
        c.vendor,
        c.items?.map(i => `${i.itemName} (${i.qty}L)`).join(", ") || "-",
        c.paymentStatus || "Pending",
        `INR ${(c.totalAmount || 0).toLocaleString("en-IN")}`
      ]);

      autoTable(doc, {
        startY: currentY + 3,
        head: challanHeaders,
        body: challanRows.length > 0 ? challanRows : [["No material bills found", "", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: [217, 119, 6], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 }
      });

      currentY = (doc.lastAutoTable?.finalY || currentY + 20) + 10;

      // --- 3. TRANSACTION LEDGER TABLE ---
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("3. Transaction Ledger", 14, currentY);

      const txHeaders = [["Date", "Type", "Party Name", "Ref Code", "Description", "Amount"]];
      const txRows = filteredTransactions.map(t => [
        formatDate(t.date),
        t.type,
        t.partyName,
        t.reference || "-",
        t.description || "-",
        `${t.type === "Payment Received" ? "+" : "-"} INR ${t.amount.toLocaleString("en-IN")}`
      ]);

      autoTable(doc, {
        startY: currentY + 3,
        head: txHeaders,
        body: txRows.length > 0 ? txRows : [["No transaction records found", "", "", "", "", ""]],
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 }
      });

      // --- FOOTER FOR ALL PAGES ---
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("Helvetica", "italic");
        doc.setTextColor(100, 116, 139);
        doc.text(
          `VC Dreams Painting Contractor | ${selectedSite.name} Report | Page ${i} of ${pageCount}`,
          14,
          287
        );
      }

      doc.save(`Site_Report_${selectedSite.name.replace(/\s+/g, "_")}_${periodText.replace(/\s+/g, "_")}.pdf`);
      toast.success("Site PDF report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report.");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Site Financials & Payouts
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Manage client billing, materials vendor transactions, and workforce costs per project site.
            </p>
          </div>

          {selectedSite && (
            <button
              onClick={() => setShowTxModal(true)}
              className="btn-primary-premium flex items-center justify-center gap-2 text-xs self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Log Transaction</span>
            </button>
          )}
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-650"></div>
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-16 rounded-[24px] text-center max-w-md mx-auto">
            <Building2 className="w-16 h-16 text-slate-350 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-outfit uppercase tracking-wider">No Active Sites Found</h3>
            <p className="text-slate-400 text-xs mt-1">Please register active sites under Site Management.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: SITE NAVIGATION LIST */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest font-outfit">Project Sites</span>
                <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-550 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/40">{filteredSites.length}</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xs p-3.5 flex items-center gap-3 transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/80">
                <Search className="text-slate-400 w-4 h-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search site, contractor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredSites.map((site) => {
                  const isSelected = selectedSite && selectedSite._id === site._id;
                  const initials = site.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  const hue = (site.name.charCodeAt(0) || 0) % 360;

                  return (
                    <div
                      key={site._id}
                      onClick={() => setSelectedSite(site)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative overflow-hidden ${
                        isSelected
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-500/30 dark:border-indigo-500/35 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-850/10"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#0B2C6F] dark:bg-indigo-500" />
                      )}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm"
                          style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%) 0%, hsl(${hue}, 70%, 55%) 100%)` }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white font-outfit uppercase tracking-wider truncate">
                            {site.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate">
                            Contractor: {site.contractorName || "N/A"}
                          </p>
                        </div>
                        <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                          {site.progress || 0}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: SITE METRICS & WORKSPACE */}
            {selectedSite && (
              <div className="lg:col-span-8 space-y-6">
                
                {/* ACTIVE SITE SUMMARY HEADER */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white font-outfit uppercase tracking-wide">
                        {selectedSite.name}
                      </h2>
                      <span className="inline-flex items-center text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 uppercase">
                        {selectedSite.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-450 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        Contractor: {selectedSite.contractorName || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedSite.location}
                      </span>
                    </div>
                  </div>

                  {/* Monthly date selectors */}
                  <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
                    {/* Overall Data Toggle Button */}
                    <button
                      onClick={() => {
                        const nextTillDate = !isTillDate;
                        setIsTillDate(nextTillDate);
                        if (nextTillDate) {
                          setActiveTab("overall");
                        } else {
                          setActiveTab("labour");
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border ${
                        isTillDate
                          ? "bg-indigo-650 border-indigo-650 text-white shadow-sm"
                          : "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/50 dark:border-slate-800/80"
                      }`}
                      title="Toggle Overall Site Data Till Date"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Overall Data</span>
                    </button>

                    {/* PDF Report Export Button */}
                    <button
                      onClick={handleExportOverallPDF}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
                      title="Export Overall Site Data PDF Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export PDF</span>
                    </button>

                    {/* Monthly date selectors */}
                    {!isTillDate && (
                      <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-150 dark:border-slate-850">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
                        <select
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setIsTillDate(false);
                          }}
                          className="bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                        >
                          {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <span className="text-slate-300 dark:text-slate-800 font-bold">|</span>
                        <select
                          value={selectedYear}
                          onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setIsTillDate(false);
                          }}
                          className="bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                        >
                          {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* SITE CARD STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  <MiniStatCard
                    title="Labour Cost"
                    value={totalLabourCost}
                    subtext={isTillDate ? "Total cost till date" : `${selectedMonth} cost`}
                    accent="border-indigo-500"
                  />
                  <MiniStatCard
                    title="Material Bills"
                    value={totalVendorCost}
                    subtext={isTillDate ? "Total challans till date" : "Challan totals"}
                    accent="border-amber-500"
                  />
                  <MiniStatCard
                    title="Received"
                    value={totalPaymentsReceived}
                    subtext={isTillDate ? "Total received till date" : "Ledger payments"}
                    accent="border-emerald-500"
                  />
                  <MiniStatCard
                    title="Site Balance"
                    value={siteBalance}
                    subtext={isTillDate ? "Net overall profit" : "Net monthly profit"}
                    accent={siteBalance >= 0 ? "border-sky-500" : "border-rose-500"}
                    isProfit={true}
                  />
                </div>

                {/* TABS CONTAINER */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 shadow-sm space-y-6">
                  
                  {/* TAB SWITCHES */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 gap-2 overflow-x-auto">
                    <TabSwitch
                      id="labour"
                      label="Labour Wages"
                      count={labourPayroll.length}
                      icon={<Users className="w-4 h-4" />}
                      activeTab={activeTab}
                      setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setIsTillDate(false);
                      }}
                    />
                    <TabSwitch
                      id="vendor"
                      label="Material Bills"
                      count={filteredChallans.length}
                      icon={<Receipt className="w-4 h-4" />}
                      activeTab={activeTab}
                      setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setIsTillDate(false);
                      }}
                    />
                    <TabSwitch
                      id="ledger"
                      label="Transaction Ledger"
                      count={filteredTransactions.length}
                      icon={<CreditCard className="w-4 h-4" />}
                      activeTab={activeTab}
                      setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setIsTillDate(false);
                      }}
                    />
                    {isTillDate && (
                      <TabSwitch
                        id="overall"
                        label="Overall (Till Date)"
                        count={labourPayroll.length + filteredChallans.length + filteredTransactions.length}
                        icon={<Sparkles className="w-4 h-4" />}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                      />
                    )}
                  </div>

                  {/* TAB ACTIONS */}
                  <AnimatePresence mode="wait">
                    {activeTab === "labour" && (
                      <motion.div
                        key="labour"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {labourPayroll.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                            <Users className="w-10 h-10 mx-auto mb-2 text-slate-350 dark:text-slate-700" />
                            <p className="text-xs font-bold uppercase tracking-wider font-outfit">No labour checks logged for {selectedMonth} {selectedYear}</p>
                          </div>
                        ) : (
                          <div className="border border-slate-200/50 dark:border-slate-800/85 rounded-2xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse min-w-[800px]">
                                <thead>
                                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 text-[10px] tracking-wider uppercase font-bold text-slate-450 dark:text-slate-500 font-outfit">
                                    <th className="px-5 py-4 text-left">Worker Name</th>
                                    <th className="px-5 py-4 text-right">Daily Rate</th>
                                    <th className="px-5 py-4 text-right">Presents</th>
                                    <th className="px-5 py-4 text-right">Half Days</th>
                                    <th className="px-5 py-4 text-right">OT Hrs</th>
                                    <th className="px-5 py-4 text-right">Tea/Bhada</th>
                                    <th className="px-5 py-4 text-right">Advance</th>
                                    <th className="px-5 py-4 text-center">Status</th>
                                    <th className="px-5 py-4 text-right">Total Cost</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                  {labourPayroll.map((w, idx) => {
                                    const workerInitials = w.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                    const workerHue = (w.name.charCodeAt(0) || 0) % 360;

                                    return (
                                      <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-350">
                                        <td className="px-5 py-3.5">
                                          <div className="flex items-center gap-3">
                                            <div
                                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0 shadow-sm"
                                              style={{ background: `hsl(${workerHue}, 65%, 52%)` }}
                                            >
                                              {workerInitials}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white font-outfit whitespace-nowrap">{w.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-medium">{w.dailyWage}</td>
                                        <td className="px-5 py-3.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">{w.presentDays}</td>
                                        <td className="px-5 py-3.5 text-right text-amber-500 font-bold">{w.halfDays}</td>
                                        <td className="px-5 py-3.5 text-right text-blue-500 font-bold">{w.overtime}h</td>
                                        <td className="px-5 py-3.5 text-right">{w.teaExpense + w.bhada}</td>
                                        <td className="px-5 py-3.5 text-right text-rose-500 font-bold">{w.advance || 0}</td>
                                        <td className="px-5 py-3.5 text-center">
                                          <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                            w.paymentStatus === "Paid"
                                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250/40"
                                              : w.paymentStatus === "Pending"
                                                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-250/40"
                                                : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-700/50"
                                          }`}>
                                            <span className={`w-1 h-1 rounded-full ${
                                              w.paymentStatus === "Paid" ? "bg-emerald-500" : w.paymentStatus === "Pending" ? "bg-amber-500" : "bg-slate-400"
                                            }`} />
                                            {w.paymentStatus}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white font-outfit">
                                          {w.grossWage}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white font-outfit">
                                    <td className="px-5 py-4 font-bold text-left uppercase">Totals</td>
                                    <td></td>
                                    <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400">{labourPayroll.reduce((sum, w) => sum + w.presentDays, 0)}</td>
                                    <td className="px-5 py-4 text-right text-amber-500">{labourPayroll.reduce((sum, w) => sum + w.halfDays, 0)}</td>
                                    <td className="px-5 py-4 text-right text-blue-500">{labourPayroll.reduce((sum, w) => sum + w.overtime, 0)}h</td>
                                    <td className="px-5 py-4 text-right">{labourPayroll.reduce((sum, w) => sum + (w.teaExpense + w.bhada), 0)}</td>
                                    <td className="px-5 py-4 text-right text-rose-500">{labourPayroll.reduce((sum, w) => sum + w.advance, 0)}</td>
                                    <td></td>
                                    <td className="px-5 py-4 text-right font-black text-slate-900 dark:text-white">{totalLabourCost}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "vendor" && (
                      <motion.div
                        key="vendor"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {filteredChallans.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-350 dark:text-slate-700" />
                            <p className="text-xs font-bold uppercase tracking-wider font-outfit">No material bills logged for {selectedMonth} {selectedYear}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredChallans.map((c) => (
                              <div
                                key={c._id}
                                className="p-5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between hover:border-indigo-500/25 transition-all shadow-xs"
                              >
                                <div>
                                  <div className="flex justify-between items-start gap-4">
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-150/40">
                                      Challan: {c.challanNo}
                                    </span>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{formatDate(c.billDate)}</span>
                                      <button
                                        onClick={() => handleToggleChallanStatus(c._id, c.paymentStatus || "Pending")}
                                        className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase transition-all duration-200 active:scale-95 cursor-pointer ${
                                          (c.paymentStatus || "Pending") === "Paid"
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250/40 hover:bg-emerald-100"
                                            : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-250/40 hover:bg-amber-100"
                                        }`}
                                      >
                                        <span className={`w-1 h-1 rounded-full ${
                                          (c.paymentStatus || "Pending") === "Paid" ? "bg-emerald-500" : "bg-amber-500"
                                        }`} />
                                        {c.paymentStatus || "Pending"}
                                      </button>
                                    </div>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit mt-3">
                                    Vendor: {c.vendor}
                                  </h4>
                                  
                                  {/* Item tags */}
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {c.items?.map((item, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex text-[9px] font-bold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400"
                                      >
                                        {item.itemName} ({item.qty} Ltr)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-850 mt-4 pt-3 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Bill Value</span>
                                  <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 font-outfit">
                                    {c.totalAmount || 0}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "ledger" && (
                      <motion.div
                        key="ledger"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {filteredTransactions.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                            <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-350 dark:text-slate-700" />
                            <p className="text-xs font-bold uppercase tracking-wider font-outfit">No transactions logged for {selectedMonth} {selectedYear}</p>
                          </div>
                        ) : (
                          <div className="border border-slate-200/50 dark:border-slate-800/85 rounded-2xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse min-w-[750px]">
                                <thead>
                                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 text-[10px] tracking-wider uppercase font-bold text-slate-450 dark:text-slate-500 font-outfit">
                                    <th className="px-5 py-4 text-left">Date</th>
                                    <th className="px-5 py-4 text-left">Type</th>
                                    <th className="px-5 py-4 text-left">Party Name</th>
                                    <th className="px-5 py-4 text-left">Ref Code</th>
                                    <th className="px-5 py-4 text-left">Description</th>
                                    <th className="px-5 py-4 text-right">Amount</th>
                                    <th className="px-5 py-4 text-center w-10"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                  {filteredTransactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-350">
                                      <td className="px-5 py-3.5 whitespace-nowrap">{formatDate(tx.date)}</td>
                                      <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                          tx.type === "Payment Received"
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250/30"
                                            : tx.type === "Vendor Payout"
                                              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-250/30"
                                              : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-250/30"
                                        }`}>
                                          <span className={`w-1 h-1 rounded-full ${
                                            tx.type === "Payment Received" ? "bg-emerald-500" : tx.type === "Vendor Payout" ? "bg-amber-500" : "bg-indigo-500"
                                          }`} />
                                          {tx.type}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3.5 font-bold text-slate-850 dark:text-slate-200">{tx.partyName}</td>
                                      <td className="px-5 py-3.5 font-medium text-slate-450">{tx.reference || "N/A"}</td>
                                      <td className="px-5 py-3.5 text-slate-400 italic max-w-[150px] truncate">{tx.description || "-"}</td>
                                      <td className={`px-5 py-3.5 text-right font-black font-outfit text-sm ${
                                        tx.type === "Payment Received" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-455"
                                      }`}>
                                        {tx.type === "Payment Received" ? "+" : "-"}{tx.amount}
                                      </td>
                                      <td className="px-5 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          {tx.type === "Payment Received" && (
                                            <button
                                              onClick={() => handlePrintReceipt(tx)}
                                              className="text-indigo-650 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 p-1.5 rounded-xl transition-all"
                                              title="Print Payment Receipt"
                                            >
                                              <Printer className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                          <button
                                            onClick={() => handleDeleteTransaction(tx._id)}
                                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/20 p-1.5 rounded-xl transition-all"
                                            title="Delete Transaction"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-855 dark:text-white font-outfit">
                                    <td className="px-5 py-4 font-bold text-left uppercase" colSpan={5}>Ledger Summary</td>
                                    <td className="px-5 py-4 text-right text-slate-900 dark:text-white">
                                      In: {totalPaymentsReceived} / Out: {filteredTransactions.filter(t => t.type !== "Payment Received").reduce((sum, t) => sum + t.amount, 0)}
                                    </td>
                                    <td></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "overall" && (
                      <motion.div
                        key="overall"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-10"
                      >
                        {/* Overall PDF Download Bar */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 dark:text-white font-outfit uppercase tracking-wider flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-500" />
                              Overall Site Statement & Financial Report
                            </h3>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">
                              Contractor: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedSite.contractorName || "N/A"}</span> | Period: <span className="font-semibold text-slate-700 dark:text-slate-300">{isTillDate ? "Overall (Till Date)" : `${selectedMonth} ${selectedYear}`}</span>
                            </p>
                          </div>
                          <button
                            onClick={handleExportOverallPDF}
                            className="btn-primary-premium flex items-center gap-2 text-xs py-2 px-4 rounded-xl shrink-0"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download PDF Report</span>
                          </button>
                        </div>
                        {/* 1. Labour Wages Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <Users className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit uppercase tracking-wide">
                              Labour Wages (Till Date)
                            </h3>
                          </div>
                          {labourPayroll.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                              <p className="text-xs font-bold uppercase tracking-wider">No labour checks logged till date</p>
                            </div>
                          ) : (
                            <div className="border border-slate-200/50 dark:border-slate-800/85 rounded-2xl overflow-hidden shadow-xs">
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[800px]">
                                  <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 text-[10px] tracking-wider uppercase font-bold text-slate-450 dark:text-slate-500 font-outfit">
                                      <th className="px-5 py-4 text-left">Worker Name</th>
                                      <th className="px-5 py-4 text-right">Daily Rate</th>
                                      <th className="px-5 py-4 text-right">Presents</th>
                                      <th className="px-5 py-4 text-right">Half Days</th>
                                      <th className="px-5 py-4 text-right">OT Hrs</th>
                                      <th className="px-5 py-4 text-right">Tea/Bhada</th>
                                      <th className="px-5 py-4 text-right">Advance</th>
                                      <th className="px-5 py-4 text-center">Status</th>
                                      <th className="px-5 py-4 text-right">Total Cost</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                    {labourPayroll.map((w, idx) => {
                                      const workerInitials = w.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                                      const workerHue = (w.name.charCodeAt(0) || 0) % 360;

                                      return (
                                        <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-350">
                                          <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                              <div
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0 shadow-sm"
                                                style={{ background: `hsl(${workerHue}, 65%, 52%)` }}
                                              >
                                                {workerInitials}
                                              </div>
                                              <span className="font-bold text-slate-900 dark:text-white font-outfit whitespace-nowrap">{w.name}</span>
                                            </div>
                                          </td>
                                          <td className="px-5 py-3.5 text-right font-medium">{w.dailyWage}</td>
                                          <td className="px-5 py-3.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">{w.presentDays}</td>
                                          <td className="px-5 py-3.5 text-right text-amber-500 font-bold">{w.halfDays}</td>
                                          <td className="px-5 py-3.5 text-right text-blue-500 font-bold">{w.overtime}h</td>
                                          <td className="px-5 py-3.5 text-right">{w.teaExpense + w.bhada}</td>
                                          <td className="px-5 py-3.5 text-right text-rose-500 font-bold">{w.advance || 0}</td>
                                          <td className="px-5 py-3.5 text-center">
                                            <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                              w.paymentStatus === "Paid"
                                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250/40"
                                                : w.paymentStatus === "Pending"
                                                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-250/40"
                                                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-700/50"
                                            }`}>
                                              <span className={`w-1 h-1 rounded-full ${
                                                w.paymentStatus === "Paid" ? "bg-emerald-500" : w.paymentStatus === "Pending" ? "bg-amber-500" : "bg-slate-400"
                                              }`} />
                                              {w.paymentStatus}
                                            </span>
                                          </td>
                                          <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white font-outfit">
                                            {w.grossWage}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white font-outfit">
                                      <td className="px-5 py-4 font-bold text-left uppercase">Totals</td>
                                      <td></td>
                                      <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400">{labourPayroll.reduce((sum, w) => sum + w.presentDays, 0)}</td>
                                      <td className="px-5 py-4 text-right text-amber-500">{labourPayroll.reduce((sum, w) => sum + w.halfDays, 0)}</td>
                                      <td className="px-5 py-4 text-right text-blue-500">{labourPayroll.reduce((sum, w) => sum + w.overtime, 0)}h</td>
                                      <td className="px-5 py-4 text-right">{labourPayroll.reduce((sum, w) => sum + (w.teaExpense + w.bhada), 0)}</td>
                                      <td className="px-5 py-4 text-right text-rose-500">{labourPayroll.reduce((sum, w) => sum + w.advance, 0)}</td>
                                      <td></td>
                                      <td className="px-5 py-4 text-right font-black text-slate-900 dark:text-white">{totalLabourCost}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Material Bills Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <Receipt className="w-5 h-5 text-amber-500" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit uppercase tracking-wide">
                              Material Bills (Till Date)
                            </h3>
                          </div>
                          {filteredChallans.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-505 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                              <p className="text-xs font-bold uppercase tracking-wider">No material bills logged till date</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {filteredChallans.map((c) => (
                                <div
                                  key={c._id}
                                  className="p-5 bg-slate-50/50 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between hover:border-indigo-500/25 transition-all shadow-xs"
                                >
                                  <div>
                                    <div className="flex justify-between items-start gap-4">
                                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-150/40">
                                        Challan: {c.challanNo}
                                      </span>
                                      <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{formatDate(c.billDate)}</span>
                                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                          (c.paymentStatus || "Pending") === "Paid"
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250/40"
                                            : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-250/40"
                                        }`}>
                                          {c.paymentStatus || "Pending"}
                                        </span>
                                      </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit mt-3">
                                      Vendor: {c.vendor}
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                      {c.items?.map((item, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex text-[9px] font-bold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400"
                                        >
                                          {item.itemName} ({item.qty} Ltr)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="border-t border-slate-100 dark:border-slate-850 mt-4 pt-3 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Bill Value</span>
                                    <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 font-outfit">
                                      {c.totalAmount || 0}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 3. Transaction Ledger Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <CreditCard className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit uppercase tracking-wide">
                              Transaction Ledger (Till Date)
                            </h3>
                          </div>
                          {filteredTransactions.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-955/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                              <p className="text-xs font-bold uppercase tracking-wider">No transactions logged till date</p>
                            </div>
                          ) : (
                            <div className="border border-slate-200/50 dark:border-slate-800/85 rounded-2xl overflow-hidden shadow-xs">
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[750px]">
                                  <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 text-[10px] tracking-wider uppercase font-bold text-slate-450 dark:text-slate-500 font-outfit">
                                      <th className="px-5 py-4 text-left">Date</th>
                                      <th className="px-5 py-4 text-left">Type</th>
                                      <th className="px-5 py-4 text-left">Party Name</th>
                                      <th className="px-5 py-4 text-left">Ref Code</th>
                                      <th className="px-5 py-4 text-left">Description</th>
                                      <th className="px-5 py-4 text-right">Amount</th>
                                      <th className="px-5 py-4 text-center w-10"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                    {filteredTransactions.map((tx) => (
                                      <tr key={tx._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-355">
                                        <td className="px-5 py-3.5 whitespace-nowrap">{formatDate(tx.date)}</td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                            tx.type === "Payment Received"
                                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-250/30"
                                              : tx.type === "Vendor Payout"
                                                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-250/30"
                                                : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-250/30"
                                          }`}>
                                            <span className={`w-1 h-1 rounded-full ${
                                              tx.type === "Payment Received" ? "bg-emerald-500" : tx.type === "Vendor Payout" ? "bg-amber-500" : "bg-indigo-500"
                                            }`} />
                                            {tx.type}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-slate-850 dark:text-slate-200">{tx.partyName}</td>
                                        <td className="px-5 py-3.5 font-medium text-slate-450">{tx.reference || "N/A"}</td>
                                        <td className="px-5 py-3.5 text-slate-400 italic max-w-[150px] truncate">{tx.description || "-"}</td>
                                        <td className={`px-5 py-3.5 text-right font-black font-outfit text-sm ${
                                          tx.type === "Payment Received" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-455"
                                        }`}>
                                          {tx.type === "Payment Received" ? "+" : "-"}{tx.amount}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                          <div className="flex items-center justify-center gap-1">
                                            {tx.type === "Payment Received" && (
                                              <button
                                                onClick={() => handlePrintReceipt(tx)}
                                                className="text-indigo-650 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 p-1.5 rounded-xl transition-all"
                                                title="Print Payment Receipt"
                                              >
                                                <Printer className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                            <button
                                              onClick={() => handleDeleteTransaction(tx._id)}
                                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/20 p-1.5 rounded-xl transition-all"
                                              title="Delete Transaction"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-855 dark:text-white font-outfit">
                                      <td className="px-5 py-4 font-bold text-left uppercase" colSpan={5}>Ledger Summary</td>
                                      <td className="px-5 py-4 text-right text-slate-900 dark:text-white">
                                        In: {totalPaymentsReceived} / Out: {filteredTransactions.filter(t => t.type !== "Payment Received").reduce((sum, t) => sum + t.amount, 0)}
                                      </td>
                                      <td></td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOG TRANSACTION MODAL */}
        <AnimatePresence>
          {showTxModal && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-[10vh] md:pt-[12vh] overflow-y-auto animate-fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-lg border border-white/20 dark:border-slate-800/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto md:my-0"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold font-outfit">Log Site Transaction</h2>
                    <p className="text-slate-400 text-[10px] mt-0.5">Manage inflows/outflows for {selectedSite?.name}</p>
                  </div>
                  <button
                    onClick={() => setShowTxModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Transaction Type</label>
                      <select
                        value={txForm.type}
                        onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold text-slate-750 dark:text-slate-300"
                      >
                        <option value="Payment Received">Payment Received (Client)</option>
                        <option value="Vendor Payout">Vendor Payout (Materials)</option>
                        <option value="Labour Payout">Labour Payout (Wages)</option>
                        <option value="Other Expense">Other Expense</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Amount</label>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={txForm.amount}
                        onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Party/Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Contractor Name, Vendor Co."
                        value={txForm.partyName}
                        onChange={(e) => setTxForm({ ...txForm, partyName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Reference Code</label>
                      <input
                        type="text"
                        placeholder="UPI Ref, Cheque No"
                        value={txForm.reference}
                        onChange={(e) => setTxForm({ ...txForm, reference: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Transaction Date</label>
                    <input
                      type="date"
                      value={txForm.date}
                      onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      placeholder="Enter optional description..."
                      value={txForm.description}
                      onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-3.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button type="submit" className="flex-1 btn-primary-premium py-3.5 text-xs">
                      Submit Transaction
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTxModal(false)}
                      className="flex-1 btn-secondary-premium py-3.5 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </MainLayout>
  );
};

const MiniStatCard = ({ title, value, subtext, accent, isProfit = false }) => {
  const isNegative = isProfit && value < 0;
  
  let bgGradient = "from-indigo-50/20 to-transparent dark:from-indigo-950/10";
  let borderHover = "hover:border-indigo-500/35";

  if (accent.includes("amber")) {
    bgGradient = "from-amber-50/20 to-transparent dark:from-amber-950/10";
    borderHover = "hover:border-amber-500/35";
  } else if (accent.includes("emerald")) {
    bgGradient = "from-emerald-50/20 to-transparent dark:from-emerald-950/10";
    borderHover = "hover:border-emerald-500/35";
  } else if (accent.includes("sky")) {
    bgGradient = "from-sky-50/20 to-transparent dark:from-sky-950/10";
    borderHover = "hover:border-sky-500/35";
  } else if (accent.includes("rose")) {
    bgGradient = "from-rose-50/20 to-transparent dark:from-rose-955/10";
    borderHover = "hover:border-rose-500/35";
  }

  return (
    <div className={`bg-gradient-to-br ${bgGradient} bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-6 py-5 rounded-[22px] shadow-sm relative overflow-hidden transition-all duration-300 ${borderHover} hover:-translate-y-0.5`}>
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-[22px] ${accent.replace("border", "bg")}`} />
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-widest font-outfit">{title}</p>
        <h3 className={`text-2xl font-black font-outfit leading-none tracking-tight ${isNegative ? "text-rose-600 dark:text-rose-455" : "text-slate-900 dark:text-white"}`}>
          <AnimatedCounter value={value} formatter={(v) => v} />
        </h3>
        <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{subtext}</p>
      </div>
    </div>
  );
};

const TabSwitch = ({ id, label, count, icon, activeTab, setActiveTab }) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
        isActive
          ? "bg-[#0B2C6F]/10 dark:bg-indigo-500/15 border-slate-200/40 dark:border-indigo-500/10 text-[#0B2C6F] dark:text-indigo-400"
          : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-black ${
        isActive ? "bg-[#0B2C6F]/20 dark:bg-indigo-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      }`}>
        {count}
      </span>
    </button>
  );
};

export default SitePayroll;
