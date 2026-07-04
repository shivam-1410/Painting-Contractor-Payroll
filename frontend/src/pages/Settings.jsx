import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  Building,
  Send,
  FileText,
  User,
  Shield,
  Upload,
  Save,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { toast } from "react-hot-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [dragActive, setDragActive] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "VC Dreams Contractors",
    email: "viral@vcdreams.in",
    phone: "6393879548",
    address: "Sangini Epitome, Surat, Gujarat",
    currency: "INR",
  });

  const [whatsappSettings, setWhatsappSettings] = useState({
    defaultCountryCode: "91",
    autoSendReceipts: true,
    apiEndpoint: "https://api.whatsapp.com/send",
    customTemplate: "Dear {Name}, here is your payroll summary for {Month}...",
  });

  const [receiptCustomization, setReceiptCustomization] = useState({
    invoicePrefix: "VCD-",
    terms: "Payment is due upon receipt. This is a computer-generated salary slip.",
    showQrCode: true,
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCompanyLogo(URL.createObjectURL(file));
      toast.success("Logo uploaded successfully!");
    }
  };

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 800);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
              System Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-medium">
              Configure system features, automated WhatsApp triggers, receipt metadata, and company information.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary-premium flex items-center justify-center gap-2 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>

        {/* SETTINGS CONTAINER WITH TABBED SIDEBAR */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* TAB SIDEBAR */}
          <div className="w-full md:w-64 flex flex-row md:flex-col gap-2.5 overflow-x-auto pb-2 md:pb-0 shrink-0">
            <TabButton
              id="general"
              label="Company Details"
              icon={<Building className="w-4 h-4" />}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              id="whatsapp"
              label="WhatsApp Integration"
              icon={<Send className="w-4 h-4" />}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              id="receipts"
              label="Receipt Styles"
              icon={<FileText className="w-4 h-4" />}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              id="security"
              label="Security & Access"
              icon={<Shield className="w-4 h-4" />}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* TAB CONTENT CARDS */}
          <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-[24px] p-6 md:p-8 shadow-xs relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">Company Information</h3>
                  
                  {/* Logo Drag & Drop */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Company Logo</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                        dragActive
                          ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        {companyLogo ? (
                          <img
                            src={companyLogo}
                            alt="Company Logo Preview"
                            className="h-16 w-16 object-contain rounded-xl bg-slate-50 p-1 border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-slate-400 dark:text-slate-655" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">Drag & Drop brand logo here, or browse files</span>
                        <span className="text-[10px] text-slate-400">Supports PNG, SVG, JPG (Max 2MB)</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <InputField
                      label="Company Name"
                      value={companyInfo.companyName}
                      onChange={(v) => setCompanyInfo({ ...companyInfo, companyName: v })}
                    />
                    <InputField
                      label="Email Address"
                      type="email"
                      value={companyInfo.email}
                      onChange={(v) => setCompanyInfo({ ...companyInfo, email: v })}
                    />
                    <InputField
                      label="Phone Number"
                      value={companyInfo.phone}
                      onChange={(v) => setCompanyInfo({ ...companyInfo, phone: v })}
                    />
                    <InputField
                      label="HQ Location Address"
                      value={companyInfo.address}
                      onChange={(v) => setCompanyInfo({ ...companyInfo, address: v })}
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "whatsapp" && (
                <motion.div
                  key="whatsapp"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">WhatsApp Messaging Integration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Default Country Code"
                      value={whatsappSettings.defaultCountryCode}
                      onChange={(v) => setWhatsappSettings({ ...whatsappSettings, defaultCountryCode: v })}
                    />
                    <InputField
                      label="API Link Endpoint"
                      value={whatsappSettings.apiEndpoint}
                      onChange={(v) => setWhatsappSettings({ ...whatsappSettings, apiEndpoint: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider block">Auto-trigger receipts</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Instantly compose WhatsApp chat links upon generating receipts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappSettings.autoSendReceipts}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, autoSendReceipts: e.target.checked })}
                      className="w-5 h-5 accent-indigo-650 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Custom Pre-filled Text Template</label>
                    <textarea
                      value={whatsappSettings.customTemplate}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, customTemplate: e.target.value })}
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all duration-200"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "receipts" && (
                <motion.div
                  key="receipts"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">Salary Receipt Customization</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Receipt Number Prefix"
                      value={receiptCustomization.invoicePrefix}
                      onChange={(v) => setReceiptCustomization({ ...receiptCustomization, invoicePrefix: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider block">QR Code Verification</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Embed unique verification QR codes in A4 PDF receipts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={receiptCustomization.showQrCode}
                      onChange={(e) => setReceiptCustomization({ ...receiptCustomization, showQrCode: e.target.checked })}
                      className="w-5 h-5 accent-indigo-650 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Footer Terms & Declarations</label>
                    <textarea
                      value={receiptCustomization.terms}
                      onChange={(e) => setReceiptCustomization({ ...receiptCustomization, terms: e.target.value })}
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-850 dark:text-slate-200 transition-all duration-200"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-outfit uppercase tracking-wider">Access Security & Policies</h3>
                  
                  <div className="p-16 text-center border border-dashed rounded-2xl bg-slate-50/40 dark:bg-slate-950/20">
                    <Shield className="w-10 h-10 text-slate-400 dark:text-slate-655 mx-auto mb-3" />
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-outfit">SaaS IAM Controls (Mocked)</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                      Configure secondary user access roles, session policies, and API keys. Features are locked under developer admin control.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

const TabButton = ({ id, label, icon, activeTab, setActiveTab }) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
        isActive
          ? "bg-[#0B2C6F]/10 dark:bg-indigo-500/15 border-slate-200/40 dark:border-indigo-500/10 text-[#0B2C6F] dark:text-indigo-400"
          : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const InputField = ({ label, value, onChange, type = "text" }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-xs font-bold text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
    </div>
  );
};

export default Settings;
