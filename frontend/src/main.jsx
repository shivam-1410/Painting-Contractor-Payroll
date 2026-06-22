import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster

position="top-right"

toastOptions={{

  duration: 3000,

  style: {

    background: "#0f172a",

    color: "#fff",

    borderRadius: "18px",

    padding: "16px",

    fontSize: "16px",

    fontWeight: "600",

  },

}}

/>
    <App />
  </React.StrictMode>,
)
