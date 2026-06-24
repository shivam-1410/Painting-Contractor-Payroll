import axios from "axios";

const API = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:8000/api"
      : "https://painting-contractor-payroll.onrender.com/api",
});

export default API;