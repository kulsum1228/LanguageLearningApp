import axios from "axios";

const API = axios.create({
  baseURL: "https://languagelearningapp-production-1e5e.up.railway.app/api",
});

export default API;
