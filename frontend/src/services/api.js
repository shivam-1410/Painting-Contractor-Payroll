import axios from "axios";

const API = axios.create({
  baseURL:
    "https://painting-contractor-payroll.onrender.com/api",
});

export default API;