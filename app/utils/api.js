import axios from "axios";

const API = axios.create({
  baseURL: "http://100.64.3.142:5000/api",
});

export default API;
