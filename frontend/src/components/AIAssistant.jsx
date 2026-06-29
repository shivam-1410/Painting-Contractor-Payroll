import { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaSpinner, FaChevronRight } from "react-icons/fa";
import API from "../services/api";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! I am your AI Contractor Assistant. I can analyze your active sites, labourers, attendance, and payroll in real-time. Ask me anything!\n\n*Tip: Try clicking one of the suggestions below.*"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "What is the total pending payment?",
    "How much did we spend on tea this month?",
    "Which labourers have the highest overtime?",
    "Show me a summary of active sites"
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || message;
    if (!query.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user", text: query }];
    setMessages(newMessages);
    setMessage("");
    setIsLoading(true);

    try {
      // Map history to the format expected by the backend
      const history = newMessages.slice(1).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await API.post("/ai/chat", {
        message: query,
        history: history
      });

      setMessages(prev => [...prev, { role: "model", text: res.data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I encountered an error. Please make sure the backend server is running and your `GEMINI_API_KEY` is configured."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse basic markdown (bold, bullets, tables, newlines)
  const renderMarkdown = (text) => {
    if (!text) return "";
    
    // Split by lines
    const lines = text.split("\n");
    return lines.map((line, index) => {
      let trimmed = line.trim();
      
      // Handle table rows
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        // Skip separator rows like |---|---|
        if (trimmed.includes("---")) return null;
        const cells = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        return (
          <div key={index} className="flex border-b border-slate-200 dark:border-slate-800 py-1.5 text-xs">
            {cells.map((cell, idx) => (
              <span key={idx} className="flex-1 font-medium text-slate-700 dark:text-slate-300">{cell}</span>
            ))}
          </div>
        );
      }

      // Handle bullet points
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const content = trimmed.substring(2);
        return (
          <ul key={index} className="list-disc list-inside pl-2 my-1 text-sm text-slate-750 dark:text-slate-350">
            <li>{parseInlineMarkdown(content)}</li>
          </ul>
        );
      }

      // Regular line
      return (
        <p key={index} className="text-sm my-1.5 leading-relaxed text-slate-750 dark:text-slate-300 break-words">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Helper for bold text
  const parseInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-outfit">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[380px] sm:w-[420px] h-[550px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in transition-all duration-300">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2 rounded-xl">
                <FaRobot className="text-xl text-indigo-100 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight font-outfit">ERP AI Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-150">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-2 rounded-full transition-colors active:scale-95"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 text-slate-850 dark:text-slate-100 rounded-tl-none"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed break-words font-medium">{msg.text}</p>
                  ) : (
                    renderMarkdown(msg.text)
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3 shadow-sm text-slate-500 dark:text-slate-400">
                  <FaSpinner className="animate-spin text-indigo-500" />
                  <span className="text-xs font-semibold tracking-wide">AI is analyzing database...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTIONS (Only show when input is empty and not loading) */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800/50 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 border border-slate-200/40 dark:border-slate-800/40 px-3 py-1.5 rounded-xl transition-all duration-155 font-medium flex items-center gap-1 text-slate-650 dark:text-slate-350 active:scale-95"
                  >
                    <span>{s}</span>
                    <FaChevronRight className="text-[9px] opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-850 flex gap-2 items-center shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about payroll, sites, attendance..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-750 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white p-3.5 rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/10"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white p-4.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center relative group"
      >
        {isOpen ? (
          <FaTimes className="text-lg" />
        ) : (
          <>
            <FaRobot className="text-xl animate-pulse" />
            <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 border-2 border-white dark:border-slate-900 w-4 h-4 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default AIAssistant;
