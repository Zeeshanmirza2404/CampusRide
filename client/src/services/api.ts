import axios, { InternalAxiosRequestConfig } from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("campusride_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
