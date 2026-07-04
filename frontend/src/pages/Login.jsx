import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

/* ── floating orb animation variants ── */
const orbVariants = {
  animate: (i) => ({
    y:   [0, -24, 0],
    x:   [0,  12, 0],
    scale: [1, 1.08, 1],
    transition: {
      duration: 5 + i * 1.2,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.6,
    },
  }),
};

/* ── staggered list variants ── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ── stats for the right panel ── */
const stats = [
  { value: "500+", label: "Labour Profiles Managed" },
  { value: "99.9%", label: "Uptime Reliability" },
  { value: "24/7",  label: "Payroll Automation" },
];

/* ── feature pills for right panel ── */
const features = [
  "Automated Salary Calculation",
  "Attendance Tracking",
  "WhatsApp Receipts",
  "Site Expense Reports",
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [tick, setTick]           = useState(0); // cycling headline

  /* cycling taglines */
  const taglines = [
    "Manage your workforce smarter.",
    "Automate salary calculations.",
    "Track attendance effortlessly.",
    "Generate receipts in one click.",
  ];
  useEffect(() => {
    const t = setInterval(() => setTick((p) => (p + 1) % taglines.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    /* Simulate auth — replace with real API call */
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    }, 1400);
  };

  return (
    <div className="min-h-screen flex font-inter bg-slate-50 dark:bg-[#080f1e] overflow-hidden">

      {/* ══════════════════════════════════════
          LEFT PANEL — FORM
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-[46%] xl:w-[42%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 relative z-10 bg-white dark:bg-[#0c1526]"
      >
        {/* subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-[400px] w-full mx-auto space-y-8 relative"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <img src="/Logo.png" alt="VC Dreams" className="h-14 w-14 object-contain drop-shadow-lg" />
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">VC Dreams</p>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-300 dark:text-slate-600">Painting Contractor ERP</p>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="space-y-1.5">
            <h1 className="text-[2rem] font-black tracking-tight text-slate-900 dark:text-white font-outfit leading-tight">
              Welcome back
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Sign in to your contractor dashboard
            </p>
          </motion.div>

          {/* Form */}
          <motion.form variants={itemVariants} onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vcdreams.in"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                <input
                  type={showPass ? "text" : "password"}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setRemember(!remember)}
                  className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    remember
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                  }`}
                >
                  {remember && (
                    <motion.svg
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"
                    >
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </motion.svg>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <button type="button" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full relative overflow-hidden py-4 rounded-2xl text-white text-sm font-black tracking-wide font-outfit shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-80"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)" }}
            >
              {/* shimmer sweep */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Footer note */}
          <motion.p variants={itemVariants} className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-600">
            VC Dreams Payroll Management System &copy; {new Date().getFullYear()}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — BRAND
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #060d1f 0%, #0b1d45 40%, #0f2a6b 100%)" }}
      >
        {/* ── Floating orbs ── */}
        {[
          { size: 380, top: "-10%",  left: "-8%",  opacity: 0.18, color: "#2563eb" },
          { size: 280, top: "55%",   left: "60%",  opacity: 0.14, color: "#3b82f6" },
          { size: 200, top: "20%",   left: "65%",  opacity: 0.10, color: "#6366f1" },
          { size: 150, top: "75%",   left: "-5%",  opacity: 0.12, color: "#1e40af" },
          { size: 100, top: "40%",   left: "30%",  opacity: 0.08, color: "#60a5fa" },
        ].map((orb, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={orbVariants}
            animate="animate"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              top: orb.top,
              left: orb.left,
              background: orb.color,
              opacity: orb.opacity,
              filter: "blur(60px)",
            }}
          />
        ))}

        {/* ── Subtle grid lines ── */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* ── Content ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col justify-between p-14 xl:p-20 w-full"
        >
          {/* Top — Logo badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-xl">
              <img src="/Logo.png" alt="VC Dreams" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wide font-outfit">VC Dreams</p>
              <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Contractor ERP</p>
            </div>
          </motion.div>

          {/* Centre — Hero Text */}
          <div className="space-y-8">
            {/* Animated tagline */}
            <div className="h-9 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tick}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="text-blue-300 text-sm font-bold tracking-wide"
                >
                  ✦ {taglines[tick]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div>
              <h2 className="text-4xl xl:text-5xl font-black text-white font-outfit leading-[1.12] tracking-tight">
                Smarter Payroll.<br />
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(90deg, #60a5fa, #818cf8, #a78bfa)" }}>
                  Zero Hassle.
                </span>
              </h2>
              <p className="mt-5 text-white/55 text-sm font-medium leading-relaxed max-w-sm">
                VC Dreams ERP automates your entire painting contractor workforce — attendance, salaries, site expenses and receipts — all in one place.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5">
              {features.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-white/80 text-[11px] font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {f}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom — Stats card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.55 }}
            className="bg-white/8 backdrop-blur-md border border-white/10 rounded-[24px] p-7 shadow-2xl"
          >
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-5">Platform Highlights</p>
            <div className="grid grid-cols-3 gap-6 divide-x divide-white/10">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className={`${i > 0 ? "pl-6" : ""}`}
                >
                  <p className="text-2xl font-black text-white font-outfit">{s.value}</p>
                  <p className="text-white/45 text-[10px] font-semibold mt-0.5 leading-snug">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Decorative diagonal lines ── */}
        <svg className="absolute bottom-0 right-0 opacity-[0.04] pointer-events-none" width="320" height="320" viewBox="0 0 320 320">
          {[0,40,80,120,160,200].map(offset => (
            <line key={offset} x1={offset} y1="0" x2="320" y2={320 - offset} stroke="white" strokeWidth="1"/>
          ))}
        </svg>
      </div>

    </div>
  );
};

export default Login;