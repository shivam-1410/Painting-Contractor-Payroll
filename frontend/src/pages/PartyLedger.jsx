import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  Download,
  Share2,
  Mail,
  Link as LinkIcon,
  Search,
  ChevronDown,
  Filter,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarDays,
  FileSpreadsheet,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";
import { formatDate } from "../utils/dateFormatter";
import AnimatedCounter from "../components/AnimatedCounter";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PartyLedger = () => {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live data states
  const [transactions, setTransactions] = useState([]);
  const [challans, setChallans] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Editable configurations
  const [customWorkValue, setCustomWorkValue] = useState("");
  const [isEditingWorkValue, setIsEditingWorkValue] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [expectedNextPayment, setExpectedNextPayment] = useState("");
  const [useAutoMilestones, setUseAutoMilestones] = useState(true);

  // New Transaction Modal States
  const [showTxModal, setShowTxModal] = useState(false);
  const [txForm, setTxForm] = useState({
    type: "Payment Received",
    amount: "",
    reference: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    adjustmentType: "Credit" // "Debit" or "Credit" (only used if type === "Adjustment")
  });

  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Print support ref
  const printRef = useRef(null);

  // Initial fetch: Load sites list
  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoading(true);
        const res = await API.get("/sites");
        const activeSites = (res.data || []).filter(s => s.status !== "Deleted");
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
    loadSites();
  }, []);

  // Fetch site-specific details on site change
  useEffect(() => {
    if (!selectedSite) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const siteId = selectedSite._id;
        const [attRes, challanRes, txRes] = await Promise.all([
          API.get(`/reports/attendance?site=${siteId}`),
          API.get(`/challans/site/${siteId}`),
          API.get(`/site-transactions/site/${siteId}`)
        ]);

        const siteAtt = attRes.data || [];
        const siteChallans = challanRes.data || [];

        setAttendance(siteAtt);
        setChallans(siteChallans);
        setTransactions(txRes.data || []);

        // Load persisted states from the Site object
        const storedWorkValue = selectedSite.contractWorkValue || "";
        const storedRemarks = selectedSite.remarks || "Default payment schedule. Payment due 15 days post milestone completion.";
        const storedNextPayment = selectedSite.expectedNextPayment || "";
        const storedUseAutoMilestones = selectedSite.useAutoMilestones !== undefined ? selectedSite.useAutoMilestones : true;

        setCustomWorkValue(storedWorkValue);
        setRemarks(storedRemarks);
        setExpectedNextPayment(storedNextPayment);
        setUseAutoMilestones(storedUseAutoMilestones);
        setCurrentPage(1); // Reset pagination
      } catch (err) {
        console.error(err);
        toast.error("Error loading ledger details for this site.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedSite?._id]);

  // Persist configurations to database
  const handleSaveConfig = async (updatedFields = {}) => {
    if (!selectedSite) return;
    try {
      const siteId = selectedSite._id;
      const payload = {
        contractWorkValue: updatedFields.contractWorkValue !== undefined ? Number(updatedFields.contractWorkValue) : (customWorkValue ? Number(customWorkValue) : 0),
        remarks: updatedFields.remarks !== undefined ? updatedFields.remarks : remarks,
        expectedNextPayment: updatedFields.expectedNextPayment !== undefined ? updatedFields.expectedNextPayment : expectedNextPayment,
        useAutoMilestones: updatedFields.useAutoMilestones !== undefined ? updatedFields.useAutoMilestones : useAutoMilestones
      };

      const res = await API.put(`/sites/${siteId}`, payload);
      // Update selectedSite in state and in sites list
      setSelectedSite(res.data);
      setSites(prev => prev.map(s => s._id === siteId ? res.data : s));
      
      setIsEditingWorkValue(false);
      toast.success("Ledger configurations saved successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save ledger configurations.");
    }
  };

  // --- Financial Calculations ---

  // 1. Labour Cost (live from attendance)
  const totalLabourCost = attendance.reduce((sum, r) => {
    const dailyWage = r.labour?.dailyWage || 0;
    const overtime = r.overtime || 0;
    const teaExpense = r.teaExpense || 0;
    const bhada = r.bhada || 0;

    let wage = 0;
    if (r.status === "Present") {
      wage = dailyWage;
    } else if (r.status === "Half Day") {
      wage = dailyWage / 2;
    }

    const otWage = overtime * (dailyWage / 8); // Updated divide-by-8 rule
    return sum + (wage + otWage + teaExpense + bhada);
  }, 0);

  // 2. Material Cost (live from challans)
  const totalVendorCost = challans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  // 3. Payments Received (from transactions)
  const paymentsReceivedList = transactions.filter(t => t.type === "Payment Received");
  const totalPaymentsReceived = paymentsReceivedList.reduce((sum, t) => sum + t.amount, 0);

  // 4. Computed Total Work Value (Contract Value)
  const computedWorkValue = Math.round((totalLabourCost + totalVendorCost) * 1.35);
  const totalWorkValue = customWorkValue ? parseInt(customWorkValue, 10) || 0 : computedWorkValue || 350000;

  // --- Build Ledger Entries ---
  const generateLedger = () => {
    const ledger = [];

    // 1. Opening Balance
    ledger.push({
      _id: "opening-balance",
      date: selectedSite ? new Date(selectedSite.createdAt || "2026-01-01") : new Date(),
      voucherNo: "VCD-OPB-01",
      description: "Opening Balance",
      paymentMode: "-",
      debit: 0,
      credit: 0,
      remarks: "Account opened",
      isSystem: true
    });

    // 2. Auto-generated Milestones / Invoices Raised (Debits) - if enabled
    if (useAutoMilestones) {
      const siteProgress = selectedSite?.progress || 0;
      const creationDate = new Date(selectedSite?.createdAt || "2026-01-01");

      // Mobilization Milestone
      ledger.push({
        _id: "auto-milestone-mobilization",
        date: new Date(creationDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        voucherNo: "INV-AUTO-101",
        description: "Invoice Raised - Project Mobilization (30% value) [Auto]",
        paymentMode: "-",
        debit: Math.round(totalWorkValue * 0.3),
        credit: 0,
        remarks: "Initial setup & staff mobilization",
        isSystem: true
      });

      // Mid-project Milestone
      if (siteProgress >= 50) {
        ledger.push({
          _id: "auto-milestone-mid",
          date: new Date(creationDate.getTime() + 15 * 24 * 60 * 60 * 1000),
          voucherNo: "INV-AUTO-148",
          description: "Invoice Raised - Wall Priming & Base Coat Handover (40% value) [Auto]",
          paymentMode: "-",
          debit: Math.round(totalWorkValue * 0.4),
          credit: 0,
          remarks: "Inspection approved by site manager",
          isSystem: true
        });
      }

      // Final Completion Milestone
      if (siteProgress >= 100) {
        ledger.push({
          _id: "auto-milestone-final",
          date: new Date(),
          voucherNo: "INV-AUTO-210",
          description: "Invoice Raised - Final Completion & Detailing (30% value) [Auto]",
          paymentMode: "-",
          debit: Math.round(totalWorkValue * 0.3),
          credit: 0,
          remarks: "Handed over to client",
          isSystem: true
        });
      } else if (siteProgress > 0 && siteProgress < 50) {
        ledger.push({
          _id: "auto-milestone-interim",
          date: new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          voucherNo: "INV-AUTO-108",
          description: `Invoice Raised - Running Bill (Interim progress at ${siteProgress}%) [Auto]`,
          paymentMode: "-",
          debit: Math.round(totalWorkValue * (siteProgress / 100)),
          credit: 0,
          remarks: "Based on certified site progress measurement sheet",
          isSystem: true
        });
      }
    }

    // 3. Process transactions list
    transactions.forEach((t) => {
      if (t.type === "Payment Received") {
        ledger.push({
          _id: t._id,
          date: new Date(t.date),
          voucherNo: t.reference ? `REC-${t.reference.toUpperCase().slice(0, 10)}` : "REC-CASH",
          description: t.description || `Payment Received - Ref: ${t.reference || "N/A"}`,
          paymentMode: t.reference ? "Online" : "Cash",
          debit: 0,
          credit: t.amount,
          remarks: t.description || "Invoice payment clearance"
        });
      } else if (t.type === "Invoice Raised") {
        ledger.push({
          _id: t._id,
          date: new Date(t.date),
          voucherNo: t.reference ? `INV-${t.reference.toUpperCase().slice(0, 10)}` : "INV-MANUAL",
          description: t.description || `Invoice Raised - Billing`,
          paymentMode: "-",
          debit: t.amount,
          credit: 0,
          remarks: t.description || "Work progress billing"
        });
      } else if (t.type === "Adjustment") {
        ledger.push({
          _id: t._id,
          date: new Date(t.date),
          voucherNo: t.reference ? `ADJ-${t.reference.toUpperCase().slice(0, 10)}` : "ADJ-MANUAL",
          description: t.description || "Ledger Adjustment",
          paymentMode: "-",
          debit: t.amount > 0 ? t.amount : 0,
          credit: t.amount < 0 ? Math.abs(t.amount) : 0,
          remarks: t.description || "Account settlement adjustment"
        });
      } else if (t.type === "Other Expense" && t.description.toLowerCase().includes("adjust")) {
        ledger.push({
          _id: t._id,
          date: new Date(t.date),
          voucherNo: `ADJ-EXP-${t._id.slice(-4).toUpperCase()}`,
          description: `Adjustment - ${t.description}`,
          paymentMode: "-",
          debit: t.amount < 0 ? 0 : t.amount,
          credit: t.amount < 0 ? Math.abs(t.amount) : 0,
          remarks: "Manual account settlement clearance"
        });
      }
    });

    // Sort ledger by date ascending to calculate running balance correctly
    const sortedLedger = ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance: balance = balance + debit - credit
    let currentBalance = 0;
    return sortedLedger.map(item => {
      currentBalance = currentBalance + item.debit - item.credit;
      return {
        ...item,
        runningBalance: currentBalance
      };
    });
  };

  const rawLedgerData = generateLedger();

  // 5. Total Billed Debits
  const totalDebit = rawLedgerData.reduce((sum, item) => sum + item.debit, 0);

  // 6. Outstanding Balance (running balance of the final transaction)
  const outstandingBalance = rawLedgerData.length > 0 ? rawLedgerData[rawLedgerData.length - 1].runningBalance : 0;

  // 7. Last Payment details
  const lastPayment = paymentsReceivedList.length > 0 
    ? [...paymentsReceivedList].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  // --- Filtering Ledger ---
  const filteredLedger = rawLedgerData.filter(item => {
    // 1. Text Search
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Payment Mode Filter
    const matchesMode =
      paymentModeFilter === "all" ||
      (paymentModeFilter === "debit" && item.debit > 0) ||
      (paymentModeFilter === "credit" && item.credit > 0) ||
      (paymentModeFilter === "invoice" && item.voucherNo.startsWith("INV")) ||
      (paymentModeFilter === "adjustment" && item.voucherNo.startsWith("ADJ")) ||
      item.paymentMode.toLowerCase() === paymentModeFilter.toLowerCase();

    // 3. Date Filters
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && item.date >= new Date(startDate);
    }
    if (endDate) {
      // Include full end day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && item.date <= endOfDay;
    }

    return matchesSearch && matchesMode && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLedger.length / itemsPerPage) || 1;
  const paginatedLedger = filteredLedger.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Donut Chart breakdown ---
  const getBreakdownData = () => {
    const groups = {
      "Cash": 0,
      "UPI": 0,
      "Cheque": 0,
      "Bank Transfer": 0,
      "NEFT/RTGS": 0
    };

    paymentsReceivedList.forEach(t => {
      const desc = (t.description || "").toLowerCase();
      const ref = (t.reference || "").toLowerCase();

      if (desc.includes("cash")) {
        groups["Cash"] += t.amount;
      } else if (ref.includes("upi") || desc.includes("upi") || ref.length === 0) {
        groups["UPI"] += t.amount;
      } else if (desc.includes("cheque") || desc.includes("chk") || ref.includes("cheque")) {
        groups["Cheque"] += t.amount;
      } else if (desc.includes("rtgs") || desc.includes("neft")) {
        groups["NEFT/RTGS"] += t.amount;
      } else {
        groups["Bank Transfer"] += t.amount;
      }
    });

    const colors = ["#0F172A", "#0B2C6F", "#F59E0B", "#10B981", "#8B5CF6"];
    return Object.keys(groups)
      .map((key, i) => ({
        name: key,
        value: groups[key],
        color: colors[i]
      }))
      .filter(item => item.value > 0);
  };

  const chartData = getBreakdownData();
  const showChart = chartData.length > 0;

  // --- Mock Attachments List ---
  const defaultAttachments = [
    { id: 1, name: "Milestone_1_Mobilization_Work_Certificate.pdf", size: "1.4 MB", type: "Certificate" },
    { id: 2, name: "Materials_Delivery_Challan_Ledger_Invoice.pdf", size: "840 KB", type: "Invoice" },
    { id: 3, name: "Direct_Client_Deposit_Bank_Receipt.jpg", size: "2.1 MB", type: "Receipt" }
  ];

  // --- Action Handlers ---

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!txForm.amount) {
      toast.error("Please enter an amount.");
      return;
    }

    try {
      let finalAmount = Number(txForm.amount);
      if (txForm.type === "Adjustment" && txForm.adjustmentType === "Credit") {
        finalAmount = -Math.abs(finalAmount);
      }

      const payload = {
        site: selectedSite._id,
        type: txForm.type,
        amount: finalAmount,
        date: txForm.date,
        partyName: selectedSite.contractorName || "Client",
        reference: txForm.reference,
        description: txForm.description
      };

      await API.post("/site-transactions", payload);
      toast.success("Transaction logged successfully!");
      setShowTxModal(false);
      
      // Reset form
      setTxForm({
        type: "Payment Received",
        amount: "",
        reference: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        adjustmentType: "Credit"
      });

      // Refetch site transactions
      const txRes = await API.get(`/site-transactions/site/${selectedSite._id}`);
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to log transaction.");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction record?")) {
      try {
        await API.delete(`/site-transactions/${id}`);
        toast.success("Transaction deleted successfully");
        // Refetch transactions list
        const txRes = await API.get(`/site-transactions/site/${selectedSite._id}`);
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete transaction.");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!selectedSite) return;

    const data = rawLedgerData.map(item => ({
      "Date": formatDate(item.date),
      "Voucher Number": item.voucherNo,
      "Description": item.description,
      "Payment Mode": item.paymentMode,
      "Debit (Work Value)": item.debit || 0,
      "Credit (Received)": item.credit || 0,
      "Running Balance": item.runningBalance || 0,
      "Remarks": item.remarks
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Party Ledger");

    // Title and metadata formatting
    XLSX.writeFile(workbook, `VC_Dreams_Ledger_${selectedSite.name.replace(/\s+/g, "_")}.xlsx`);
    toast.success("Ledger statement downloaded in Excel format!");
  };

  const handleExportPDF = () => {
    if (!selectedSite) return;

    const doc = new jsPDF();

    // Company Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("VC Dreams Painting Contractor", 14, 20);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text("Plot No 48, GIDC Industrial Estate, Sector 26, Gandhinagar, Gujarat", 14, 26);
    doc.text("GSTIN: 24AAAFV9827K1Z4 | Email: support@vcdreams.in | Phone: +91 98250 11223", 14, 31);
    doc.line(14, 35, 196, 35);

    // Document Title
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text("PARTY LEDGER STATEMENT", 14, 45);

    // Party Information
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.text(`Party Name: ${selectedSite.contractorName || "Viral Patel"}`, 14, 53);
    doc.text(`Project Site: ${selectedSite.name}`, 14, 58);
    doc.text(`Ledger Number: VCD-LDG-${selectedSite._id.slice(-6).toUpperCase()}`, 14, 63);
    doc.text(`Period: Till Date (Overall)`, 14, 68);

    doc.text(`Generated Date: ${new Date().toLocaleString("en-IN")}`, 130, 53);
    doc.text(`Total Work Order Value: INR ${totalWorkValue.toLocaleString("en-IN")}`, 130, 58);
    doc.text(`Total Amount Received: INR ${totalPaymentsReceived.toLocaleString("en-IN")}`, 130, 63);
    doc.text(`Outstanding Balance: INR ${outstandingBalance.toLocaleString("en-IN")}`, 130, 68);

    doc.line(14, 73, 196, 73);

    // Ledger Table
    const tableHeaders = [["Date", "Voucher", "Description", "Mode", "Debit (Dr)", "Credit (Cr)", "Balance"]];
    const tableRows = rawLedgerData.map(item => [
      formatDate(item.date),
      item.voucherNo,
      item.description,
      item.paymentMode,
      item.debit ? `INR ${item.debit.toLocaleString("en-IN")}` : "-",
      item.credit ? `INR ${item.credit.toLocaleString("en-IN")}` : "-",
      `INR ${item.runningBalance.toLocaleString("en-IN")}`
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 78,
      theme: "striped",
      headStyles: { fillColor: [11, 44, 111], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        2: { cellWidth: 55 }, // Limit description column width
      }
    });

    // Footer Info
    const finalY = (doc.lastAutoTable?.finalY || 150) + 15;
    doc.setFontSize(8);
    doc.setFont("Helvetica", "italic");
    doc.text("This is a computer-generated ledger statement and does not require a physical signature.", 14, finalY);
    doc.text("VC Dreams ERP - Financial Clarity & Trust.", 14, finalY + 4);

    doc.save(`VC_Dreams_Ledger_${selectedSite.name.replace(/\s+/g, "_")}.pdf`);
    toast.success("Ledger statement downloaded in PDF format!");
  };

  const handleShareWhatsApp = () => {
    if (!selectedSite) return;
    const text = encodeURIComponent(
      `*VC Dreams - Party Ledger Statement*\n\n` +
      `*Party Name:* ${selectedSite.contractorName || "Viral Patel"}\n` +
      `*Project Site:* ${selectedSite.name}\n` +
      `*Total Work Value:* INR ${totalWorkValue.toLocaleString("en-IN")}\n` +
      `*Total Received:* INR ${totalPaymentsReceived.toLocaleString("en-IN")}\n` +
      `*Outstanding Balance:* INR ${outstandingBalance.toLocaleString("en-IN")}\n` +
      `*Status:* ${outstandingBalance === 0 ? "PAID" : "OUTSTANDING"}\n\n` +
      `Please check the attached statements. Generated via VC Dreams Contractor ERP.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleEmailLedger = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Mailing statement to client...",
        success: `Ledger statement mailed successfully to client email!`,
        error: "Failed to dispatch email."
      }
    );
  };

  const handleCopyPublicLink = () => {
    const dummyUrl = `https://vcdreams.in/public/ledger/${selectedSite?._id || "token"}`;
    navigator.clipboard.writeText(dummyUrl);
    toast.success("Public ledger link copied to clipboard!");
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8" ref={printRef}>
        
        {/* PRINT SPECIFIC STYLESHEET */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
              font-size: 10px !important;
            }
            header, nav, aside, footer, button, select, input, .no-print, .floating-actions, .theme-selector {
              display: none !important;
            }
            .print-container {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .print-layout-card {
              border: 1px solid #e2e8f0 !important;
              box-shadow: none !important;
              background: white !important;
            }
            .recharts-responsive-container {
              display: none !important;
            }
          }
        `}} />

        {/* TOP BAR / SITE SELECTOR & FLOATING ACTIONS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              Party Ledger
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              View, print, and export official statement accounts for project contractors and developers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Site selector dropdown */}
            <div className="relative">
              <select
                value={selectedSite?._id || ""}
                onChange={(e) => {
                  const s = sites.find(item => item._id === e.target.value);
                  if (s) setSelectedSite(s);
                }}
                className="appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 transition-all text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs"
              >
                {sites.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} - {s.contractorName || "No Name"}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-850/60 shadow-xs">
              <button
                onClick={handlePrint}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 active:scale-95 transition-all"
                title="Print Statement"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportPDF}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 active:scale-95 transition-all"
                title="Download PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportExcel}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 active:scale-95 transition-all"
                title="Export Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 active:scale-95 transition-all"
                title="Share on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleEmailLedger}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-905 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 active:scale-95 transition-all"
                title="Email Statement"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyPublicLink}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-905 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 active:scale-95 transition-all"
                title="Copy Shareable Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Log Entry Button */}
            <button
              onClick={() => setShowTxModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-500/10 active:scale-95 cursor-pointer no-print"
            >
              <Plus className="w-4 h-4" />
              <span>Log Entry</span>
            </button>
          </div>
        </div>

        {/* LOADING SHIM */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-650"></div>
          </div>
        ) : !selectedSite ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border rounded-3xl p-10">
            <Info className="w-12 h-12 text-slate-350 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit uppercase">No Sites Registered</h3>
            <p className="text-xs text-slate-400 mt-2">Please register an active site in the Site Manager to begin tracking client accounts.</p>
          </div>
        ) : (
          <div className="space-y-8 print-container">
            
            {/* 1. OFFICIAL COMPANY LETTERHEAD / HEADER */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800/80 shadow-xs print-layout-card">
              <div className="flex flex-col md:flex-row md:justify-between items-start md:items-stretch gap-6">
                
                {/* Left: Branding & Address */}
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-[20px] bg-indigo-55 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0">
                    <img src="/Logo.png" alt="VC Dreams Logo" className="h-10 w-10 object-contain" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0B2C6F] dark:text-white font-outfit tracking-wide uppercase leading-none">
                      VC Dreams Painting Contractor
                    </h2>
                    <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold tracking-widest uppercase mt-1">
                      PARTY LEDGER STATEMENT
                    </p>
                    <div className="text-[10px] text-slate-450 dark:text-slate-505 font-medium space-y-0.5 mt-3 leading-relaxed max-w-sm">
                      <p>Plot No 48, GIDC Industrial Estate, Sector 26,</p>
                      <p>Gandhinagar, Gujarat - 382026</p>
                      <p className="font-bold text-slate-700 dark:text-slate-450 mt-1">GSTIN: 24AAAFV9827K1Z4</p>
                      <p>Email: billing@vcdreams.in | Phone: +91 98250 11223</p>
                    </div>
                  </div>
                </div>

                {/* Right: Verification QR Code */}
                <div className="flex md:flex-col justify-between items-end gap-3 self-stretch md:self-auto border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-850 pt-4 md:pt-0 md:pl-6 shrink-0 w-full md:w-auto">
                  <div className="flex flex-col text-left md:text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Statement Key</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white mt-1.5 font-outfit uppercase">
                      VCD-ST-{selectedSite._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[8px] text-slate-455 font-bold uppercase tracking-wider mt-1">Status: SECURE GEN</span>
                  </div>

                  {/* QR SVG */}
                  <svg className="w-16 h-16 text-slate-850 dark:text-white" viewBox="0 0 100 100">
                    <rect x="0" y="0" width="100" height="100" fill="none" />
                    {/* Outer squares */}
                    <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="12" y="12" width="11" height="11" fill="currentColor" />

                    <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="77" y="12" width="11" height="11" fill="currentColor" />

                    <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="12" y="77" width="11" height="11" fill="currentColor" />

                    {/* Small noise boxes */}
                    <rect x="40" y="10" width="8" height="8" fill="currentColor" />
                    <rect x="50" y="5" width="6" height="6" fill="currentColor" />
                    <rect x="40" y="25" width="12" height="6" fill="currentColor" />
                    <rect x="55" y="20" width="8" height="12" fill="currentColor" />

                    <rect x="10" y="40" width="10" height="6" fill="currentColor" />
                    <rect x="5" y="52" width="8" height="8" fill="currentColor" />
                    <rect x="25" y="45" width="10" height="15" fill="currentColor" />

                    <rect x="70" y="40" width="10" height="10" fill="currentColor" />
                    <rect x="85" y="45" width="8" height="8" fill="currentColor" />
                    <rect x="70" y="60" width="15" height="5" fill="currentColor" />

                    <rect x="45" y="70" width="12" height="12" fill="currentColor" />
                    <rect x="40" y="85" width="15" height="8" fill="currentColor" />
                    <rect x="70" y="80" width="8" height="15" fill="currentColor" />
                    <rect x="85" y="80" width="10" height="10" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. PARTY INFORMATION CARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800/80 shadow-xs print-layout-card">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-850">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white font-outfit uppercase tracking-wider">
                    Party & Account Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-5">
                  <InfoItem label="Party Name" value={selectedSite.contractorName || "Viral Patel"} />
                  <InfoItem label="Associated Site" value={selectedSite.name} />
                  <InfoItem label="Mobile Number" value="+91 98250 88990" />
                  <InfoItem label="Ledger Number" value={`VCD-LDG-${selectedSite._id.slice(-6).toUpperCase()}`} />
                  <InfoItem label="Statement Period" value="Overall (Till Date)" />
                  <InfoItem label="Generated Date & Time" value={new Date().toLocaleString("en-IN")} />
                </div>
              </div>

              {/* Status & Contract value configuration */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800/80 shadow-xs print-layout-card flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-855">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-outfit uppercase tracking-wider">Status Overview</span>
                    {outstandingBalance <= 0 ? (
                      <span className="px-3 py-1 text-[9px] font-black tracking-widest bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-450 rounded-full border border-emerald-200/40 uppercase">
                        Paid
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-[9px] font-black tracking-widest bg-amber-50 dark:bg-amber-950/30 text-amber-655 dark:text-amber-450 rounded-full border border-amber-250/30 uppercase">
                        Outstanding
                      </span>
                    )}
                  </div>

                  {/* Configurable budget */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contract Work Value</span>
                      <button
                        onClick={() => {
                          if (isEditingWorkValue) {
                            handleSaveConfig();
                          } else {
                            setIsEditingWorkValue(true);
                          }
                        }}
                        className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wide no-print"
                      >
                        {isEditingWorkValue ? "Save" : "Change"}
                      </button>
                    </div>

                    {isEditingWorkValue ? (
                      <div className="flex gap-2 mt-2 no-print">
                        <input
                          type="number"
                          value={customWorkValue}
                          placeholder={String(computedWorkValue)}
                          onChange={(e) => setCustomWorkValue(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => {
                            setIsEditingWorkValue(false);
                            setCustomWorkValue(selectedSite.contractWorkValue || "");
                          }}
                          className="px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-550"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-lg font-black text-slate-800 dark:text-white font-outfit mt-1">
                        INR {totalWorkValue.toLocaleString("en-IN")}
                        {!customWorkValue && (
                          <span className="text-[8px] text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded-md ml-2 font-extrabold tracking-wide uppercase align-middle">
                            Auto Est
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Auto Milestone switch toggle */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850/60 pt-3 mt-3 no-print">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auto Milestones</span>
                      <div className="relative group">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500 transition-colors cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[9px] text-slate-200 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 leading-normal font-medium shadow-xl">
                          Automatically generates project progress-based billing milestones (30% mobilization, etc.)
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAutoMilestones}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setUseAutoMilestones(val);
                          handleSaveConfig({ useAutoMilestones: val });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-250 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-[16px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                  {outstandingBalance <= 0 ? (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-150/35 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider leading-none">Fully Paid</p>
                        <p className="text-[9px] text-emerald-600/80 dark:text-emerald-500 mt-1 font-semibold leading-relaxed">No dues are outstanding against this contractor account.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-150/35 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-rose-850 dark:text-rose-400 uppercase tracking-wider leading-none">Outstanding Dues</p>
                        <p className="text-[9px] text-rose-600/80 dark:text-rose-500 mt-1 font-semibold leading-relaxed">INR {outstandingBalance.toLocaleString("en-IN")} remains pending.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. FINANCIAL SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Contract Work Value"
                value={`₹${totalWorkValue.toLocaleString("en-IN")}`}
                subtext="Total contract budget value"
                icon={<Briefcase className="w-5 h-5 text-indigo-500" />}
                gradient="from-indigo-500/5 to-indigo-650/5"
              />
              <StatCard
                title="Total Billed"
                value={`₹${totalDebit.toLocaleString("en-IN")}`}
                subtext="Total invoices & debits"
                icon={<FileText className="w-5 h-5 text-blue-500" />}
                gradient="from-blue-500/5 to-blue-650/5"
              />
              <StatCard
                title="Amount Received"
                value={`₹${totalPaymentsReceived.toLocaleString("en-IN")}`}
                subtext="Total payments logged to date"
                icon={<ArrowDownLeft className="w-5 h-5 text-emerald-500" />}
                gradient="from-emerald-500/5 to-emerald-650/5"
              />
              <StatCard
                title="Outstanding Balance"
                value={`₹${outstandingBalance.toLocaleString("en-IN")}`}
                subtext="Remaining ledger balance"
                icon={<ArrowUpRight className="w-5 h-5 text-rose-500" />}
                gradient="from-rose-500/5 to-rose-650/5"
                isNegative={outstandingBalance > 0}
              />
            </div>

            {/* 4. MAIN LEDGER STATEMENT DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Ledger Table */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800/80 shadow-xs print-layout-card">
                  
                  {/* Table Toolbar Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-850 no-print">
                    
                    {/* Search bar */}
                    <div className="relative max-w-xs w-full group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-505 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search ledger..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                      />
                    </div>

                    {/* Mode and Date filters */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Mode Filter */}
                      <select
                        value={paymentModeFilter}
                        onChange={(e) => setPaymentModeFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-855 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        <option value="all">All Entries</option>
                        <option value="debit">Debits (Dr)</option>
                        <option value="credit">Credits (Cr)</option>
                        <option value="invoice">Invoices Raised</option>
                        <option value="adjustment">Adjustments</option>
                        <option value="cash">Cash Mode</option>
                        <option value="upi">UPI Mode</option>
                        <option value="bank transfer">Bank Trans</option>
                      </select>

                      {/* Date Range inputs */}
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-150 dark:border-slate-850 text-xs text-slate-455 font-bold">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-transparent outline-none max-w-[100px] cursor-pointer"
                        />
                        <span>-</span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-transparent outline-none max-w-[100px] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ledger Table Rendering */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[750px]">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 text-[10px] tracking-wider uppercase font-bold text-slate-450 dark:text-slate-550 font-outfit">
                          <th className="px-5 py-4 text-left">Date</th>
                          <th className="px-5 py-4 text-left">Voucher</th>
                          <th className="px-5 py-4 text-left">Description</th>
                          <th className="px-5 py-4 text-center">Mode</th>
                          <th className="px-5 py-4 text-right">Debit (Dr)</th>
                          <th className="px-5 py-4 text-right">Credit (Cr)</th>
                          <th className="px-5 py-4 text-right">Balance</th>
                          <th className="px-5 py-4 text-center no-print">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {paginatedLedger.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-550">
                              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-200 dark:text-slate-800" />
                              <p className="text-xs font-bold uppercase tracking-wider">No ledger entries match current filters</p>
                            </td>
                          </tr>
                        ) : (
                          paginatedLedger.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-350">
                              <td className="px-5 py-3.5 whitespace-nowrap">{formatDate(item.date)}</td>
                              <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[10px] font-bold text-indigo-650 dark:text-indigo-400">
                                {item.voucherNo}
                              </td>
                              <td className="px-5 py-3.5 max-w-[200px] truncate" title={item.description}>
                                {item.description}
                              </td>
                              <td className="px-5 py-3.5 text-center whitespace-nowrap uppercase text-[9px] font-black text-slate-450">
                                {item.paymentMode}
                              </td>
                              <td className="px-5 py-3.5 text-right font-medium text-indigo-650 dark:text-indigo-400">
                                {item.debit > 0 ? `₹${item.debit.toLocaleString("en-IN")}` : "-"}
                              </td>
                              <td className="px-5 py-3.5 text-right font-black text-emerald-600 dark:text-emerald-450 font-outfit">
                                {item.credit > 0 ? `+₹${item.credit.toLocaleString("en-IN")}` : "-"}
                              </td>
                              <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white font-outfit">
                                ₹{item.runningBalance.toLocaleString("en-IN")}
                              </td>
                              <td className="px-5 py-3.5 text-center whitespace-nowrap no-print">
                                {!item.isSystem ? (
                                  <button
                                    onClick={() => handleDeleteTransaction(item._id)}
                                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-955 active:scale-95 cursor-pointer"
                                    title="Delete ledger entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-600 font-bold font-mono text-[8px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded">System</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-850 mt-6 no-print">
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-905 border border-slate-150 dark:border-slate-850 rounded-lg text-[10px] font-bold text-slate-650 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Previous
                        </button>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-905 border border-slate-150 dark:border-slate-850 rounded-lg text-[10px] font-bold text-slate-650 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ATTACHMENTS & UPLOADS */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800/80 shadow-xs print-layout-card no-print">
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-850">
                    <Receipt className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white font-outfit uppercase tracking-wider">
                      Ledger Documents & Attachments
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    {defaultAttachments.map(att => (
                      <div
                        key={att.id}
                        className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shrink-0">
                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate font-outfit" title={att.name}>
                              {att.name}
                            </h4>
                            <p className="text-[9px] text-slate-450 font-bold mt-1 uppercase tracking-wider">
                              {att.type} • {att.size}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-850 mt-4 pt-3 flex items-center justify-between">
                          <button
                            onClick={() => toast.success(`Simulating preview of ${att.name}`)}
                            className="text-[9px] font-black text-indigo-650 hover:underline uppercase tracking-wider"
                          >
                            Preview
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toast.success(`Simulating download of ${att.name}`)}
                              className="text-slate-400 hover:text-slate-650"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toast.success(`Simulating print of ${att.name}`)}
                              className="text-slate-400 hover:text-slate-650"
                              title="Print File"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Sidebar Timeline, Chart & Notes */}
              <div className="space-y-8">
                
                {/* PAYMENT BREAKDOWN DONUT CHART */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800/80 shadow-xs print-layout-card flex flex-col justify-between min-h-[300px]">
                  <div className="pb-4 border-b border-slate-100 dark:border-slate-850">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-outfit uppercase tracking-wider">
                      Payment Breakdown
                    </span>
                  </div>

                  {showChart ? (
                    <div className="h-44 mt-4 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `INR ${value.toLocaleString("en-IN")}`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest leading-none">Total Received</span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-1 font-outfit">
                          ₹{totalPaymentsReceived.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-550">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-200 dark:text-slate-800" />
                      <p className="text-[10px] font-black uppercase tracking-wider">No payments received to graph</p>
                    </div>
                  )}

                  {showChart && (
                    <div className="grid grid-cols-2 gap-2 mt-4 text-[9px] font-bold text-slate-455 uppercase tracking-wider">
                      {chartData.map((item, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PAYMENT TIMELINE */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800/80 shadow-xs print-layout-card">
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-850">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white font-outfit uppercase tracking-wider">
                      Payment Timeline
                    </h3>
                  </div>

                  <div className="mt-5 space-y-5">
                    {paymentsReceivedList.length === 0 ? (
                      <div className="text-center py-6 text-slate-455">
                        <p className="text-[10px] font-black uppercase tracking-wider">No payments logged yet</p>
                      </div>
                    ) : (
                      [...paymentsReceivedList]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 5)
                        .map((t, index) => (
                          <div key={t._id || index} className="flex gap-4">
                            {/* Marker line */}
                            <div className="flex flex-col items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-650 border-2 border-white dark:border-slate-900 shadow-sm shrink-0" />
                              {index < Math.min(paymentsReceivedList.length - 1, 4) && (
                                <span className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800 mt-1" />
                              )}
                            </div>
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline gap-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white font-outfit">
                                  ₹{t.amount.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[9px] text-slate-455 dark:text-slate-500 font-extrabold uppercase whitespace-nowrap">
                                  {formatDate(t.date)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-455 dark:text-slate-400 mt-0.5">
                                {t.reference ? `Ref: ${t.reference}` : "Cash Deposit"}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* EDITABLE ACCOUNT REMARKS SECTION */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800/80 shadow-xs print-layout-card no-print">
                  <div className="pb-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-outfit uppercase tracking-wider">
                      Remarks & Observations
                    </span>
                    <button
                      onClick={handleSaveConfig}
                      className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wide"
                    >
                      Save Remarks
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {/* Remarks input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Client Payment Remarks</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-indigo-500 min-h-[60px] leading-relaxed resize-none"
                      />
                    </div>

                    {/* Expected next date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Expected Next Payment Date</label>
                      <input
                        type="date"
                        value={expectedNextPayment}
                        onChange={(e) => setExpectedNextPayment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 5. OFFICIAL COMPLIANCE FOOTER */}
            <div className="border-t border-slate-200/50 dark:border-slate-800/80 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-455 dark:text-slate-500 font-medium font-outfit uppercase gap-4 text-center sm:text-left print-layout-card p-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200">
              <div className="space-y-1">
                <p className="font-extrabold text-slate-700 dark:text-slate-400">“This is a computer-generated ledger statement and does not require a physical signature.”</p>
                <p>VC Dreams ERP platform security verification code: SHA-256/VCD/GEN</p>
              </div>
              <div className="text-right flex flex-col gap-0.5">
                <span className="font-extrabold text-[#0B2C6F] dark:text-indigo-400">VC Dreams Painting Contractor</span>
                <span>Website: www.vcdreams.in | Support: billing@vcdreams.in</span>
              </div>
            </div>

          </div>
        )}

        {/* TRANSACTION MODAL */}
        <AnimatePresence>
          {showTxModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden"
              >
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-outfit">Log Ledger Entry</h3>
                  <button
                    onClick={() => setShowTxModal(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
                  {/* Transaction Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Entry Type</label>
                    <select
                      value={txForm.type}
                      onChange={(e) => setTxForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Payment Received">Payment Received (Credit / Cr)</option>
                      <option value="Invoice Raised">Invoice Raised (Debit / Dr)</option>
                      <option value="Adjustment">Adjustment</option>
                    </select>
                  </div>

                  {/* Adjustment Type Sub-option */}
                  {txForm.type === "Adjustment" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Adjustment Effect</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTxForm(prev => ({ ...prev, adjustmentType: "Debit" }))}
                          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                            txForm.adjustmentType === "Debit"
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-400"
                              : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                          }`}
                        >
                          Debit (Dr) - Bill Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setTxForm(prev => ({ ...prev, adjustmentType: "Credit" }))}
                          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                            txForm.adjustmentType === "Credit"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400"
                              : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                          }`}
                        >
                          Credit (Cr) - Waive/Pay
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Amount and Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amount (INR)</label>
                      <input
                        type="number"
                        required
                        value={txForm.amount}
                        onChange={(e) => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="e.g. 50000"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        required
                        value={txForm.date}
                        onChange={(e) => setTxForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Reference / Voucher Code */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reference / Voucher No. (Optional)</label>
                    <input
                      type="text"
                      value={txForm.reference}
                      onChange={(e) => setTxForm(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="e.g. TXN102384, UPI2847, etc."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Description</label>
                    <textarea
                      value={txForm.description}
                      onChange={(e) => setTxForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter description remarks..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-700 dark:text-white focus:outline-none focus:border-indigo-500 min-h-[60px] resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTxModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-655 dark:text-slate-350 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                      Save Entry
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

// Sub-component for individual item inside Party Info card
const InfoItem = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">{label}</span>
      <span className="text-xs font-black text-slate-800 dark:text-slate-150 mt-1.5 font-outfit">{value}</span>
    </div>
  );
};

// Sub-component for Financial Metric Card
const StatCard = ({ title, value, subtext, icon, gradient, isNegative = false }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] shadow-xs flex flex-col justify-between overflow-hidden relative group print-layout-card`}
    >
      {/* Background radial gradient glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} rounded-full blur-2xl pointer-events-none opacity-50 group-hover:scale-125 transition-transform duration-500`} />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{title}</span>
          <h3 className={`text-xl font-black font-outfit leading-none tracking-tight ${
            isNegative ? "text-rose-600 dark:text-rose-455" : "text-slate-900 dark:text-white"
          }`}>
            {value}
          </h3>
        </div>
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">
          {icon}
        </div>
      </div>

      <p className="text-[8px] text-slate-455 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-4 leading-none">{subtext}</p>
    </motion.div>
  );
};

export default PartyLedger;
