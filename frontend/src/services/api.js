import axios from "axios";

const API = axios.create({
  baseURL:
    window.location.hostname.includes("onrender.com")
      ? "https://painting-contractor-payroll.onrender.com/api"
      : `http://${window.location.hostname || "localhost"}:8000/api`,
});

export default API;