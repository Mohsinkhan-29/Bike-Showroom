import axios from "axios";

const baseURL = "https://bike-showroom-2d06.onrender.com/api";

export const api = axios.create({ baseURL });

// Attach the admin JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sma_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token has expired/is invalid, boot the admin back to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem("sma_admin_token")) {
      localStorage.removeItem("sma_admin_token");
      localStorage.removeItem("sma_admin_user");
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);
