import axios from "axios";
import { getAccessToken } from "../auth/auth";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.128.90.220:8080" || "http://localhost:8080";

//  Android emulator: 10.0.2.2
// Real device: use your PC IP like http://192.168.x.x:8080

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
