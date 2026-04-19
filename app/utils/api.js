import axios from "axios";

const API = axios.create({
  baseURL: "http://10.14.34.232:5000/api",
});

export default API;
