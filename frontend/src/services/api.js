import axios from "axios";

const isLocalHost = (hostname) => {
  if (!hostname) return true;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  ) {
    return true;
  }
  // Check for private IPv4 addresses (192.168.x.x, 10.x.x.x, 172.16.x.x to 172.31.x.x)
  const parts = hostname.split(".");
  if (parts.length === 4) {
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);
    if (first === 192 && second === 168) return true;
    if (first === 10) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
  }
  return false;
};

const API = axios.create({
  baseURL: isLocalHost(window.location.hostname)
    ? `http://${window.location.hostname || "localhost"}:8000/api`
    : "https://painting-contractor-payroll.onrender.com/api",
});

export default API;