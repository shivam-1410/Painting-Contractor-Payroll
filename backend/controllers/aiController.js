const { GoogleGenerativeAI } = require("@google/generative-ai");
const Site = require("../models/Site");
const Labour = require("../models/Labour");
const Attendance = require("../models/Attendance");
const Payroll = require("../models/Payroll");

exports.handleAIChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        text: "Hi! It looks like **GEMINI_API_KEY** is not set in the backend `.env` file.\n\nTo enable this AI Assistant, please:\n1. Open the file `backend/.env`.\n2. Add the line: `GEMINI_API_KEY=your_actual_api_key`.\n3. Restart the backend server.\n\nOnce added, I'll be able to analyze your sites, attendance, and payroll data in real-time!",
        isKeyMissing: true
      });
    }

    // Fetch context data in parallel
    const [sites, labours, recentAttendance, recentPayrolls] = await Promise.all([
      Site.find({ status: { $ne: "Deleted" } }).lean(),
      Labour.find().lean(),
      Attendance.find()
        .populate("labour")
        .populate("site")
        .sort({ date: -1 })
        .limit(100)
        .lean(),
      Payroll.find()
        .populate("labour")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    ]);

    // Format context data for the AI
    const systemPrompt = `You are a highly capable AI Assistant integrated into "VC Dreams - Contractor ERP", a custom ERP and payroll management system for a painting contractor.

Below is the live structured data from the ERP database:

=== SITES ===
${JSON.stringify(
  sites.map((s) => ({
    name: s.name,
    location: s.location,
    status: s.status,
    progress: `${s.progress}%`,
    contractorName: s.contractorName
  })),
  null,
  2
)}

=== LABOURERS ===
${JSON.stringify(
  labours.map((l) => ({
    name: l.name,
    phone: l.phone,
    dailyWage: `₹${l.dailyWage}`,
    joiningDate: l.joiningDate
  })),
  null,
  2
)}

=== RECENT ATTENDANCE (Last 100 records) ===
${JSON.stringify(
  recentAttendance.map((a) => ({
    labourName: a.labour?.name || a.labourName || "Unknown",
    siteName: a.site?.name || "N/A",
    status: a.status,
    date: new Date(a.date).toLocaleDateString("en-IN"),
    overtimeHours: a.overtime || a.nightShift || 0,
    teaExpense: `₹${a.teaExpense || 0}`,
    bhada: `₹${a.bhada || 0}`,
    advance: `₹${a.advance || 0}`
  })),
  null,
  2
)}

=== RECENT PAYROLLS ===
${JSON.stringify(
  recentPayrolls.map((p) => ({
    labourName: p.labourName || p.labour?.name || "Unknown",
    siteName: p.siteName || "N/A",
    monthYear: `${p.month} ${p.year}`,
    presentDays: p.presentDays,
    halfDays: p.halfDays,
    overtimeHours: p.overtime || 0,
    teaExpense: `₹${p.teaExpense || 0}`,
    bhada: `₹${p.bhada || 0}`,
    advance: `₹${p.advance || 0}`,
    totalSalary: `₹${p.totalSalary || 0}`,
    paymentStatus: p.paymentStatus
  })),
  null,
  2
)}

Instructions:
1. Answer the user's questions accurately using the provided ERP database context.
2. If the user asks about specific calculations (e.g. total pending payouts, total tea expenses for a site, etc.), calculate them dynamically using the context data.
3. Be professional, friendly, and concise.
4. Format your responses beautifully using Markdown (lists, tables, bold text, etc.).
5. If the user asks about something not present in the data, state clearly that you don't have that information. Do not make up any data.
`;

    // Initialize Gemini using the correct API client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Construct chat history
    const chatHistory = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I have loaded the live ERP database. How can I help you manage your painting contractor operations today?" }]
      }
    ];

    // Add conversation history if present
    if (history && Array.isArray(history)) {
      history.forEach((turn) => {
        chatHistory.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      });
    }

    // Start chat session
    const chat = model.startChat({
      history: chatHistory
    });

    // Send the current message
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({
      text: responseText
    });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      message: "An error occurred while communicating with the AI Assistant: " + error.message
    });
  }
};
