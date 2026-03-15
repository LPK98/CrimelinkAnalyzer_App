import axios from "axios";
import { getAccessToken } from "../auth/auth";
import { appConfig } from "../constants/appConfig";

export const API_BASE_URL = appConfig.apiUrl;

if (!API_BASE_URL) {
  throw new Error("API base URL is not defined in environment variables");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
