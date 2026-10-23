import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "");
const apiBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

export const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token to requests
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
