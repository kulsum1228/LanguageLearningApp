import axios from "axios";

const API = axios.create({
  baseURL: "http://100.64.6.250:5000/api",
});

export default API;
