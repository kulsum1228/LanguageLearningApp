import axios from "axios";

const API = axios.create({
  // baseURL: "https://languagelearningapp-production-1e5e.up.railway.app/api",
  baseURL: "http://100.64.5.64:5000/api",
});

export default API;
