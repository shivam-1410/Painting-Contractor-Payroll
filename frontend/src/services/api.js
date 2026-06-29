import axios from "axios";

const API = axios.create({
  baseURL:
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8000/api"
      : "https://painting-contractor-payroll.onrender.com/api",
});

export default API;