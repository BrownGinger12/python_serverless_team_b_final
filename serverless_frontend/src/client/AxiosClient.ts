import axios from "axios";

const API_BASE_URL = "https://nixylyescc.execute-api.us-east-2.amazonaws.com";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

export default axiosClient;