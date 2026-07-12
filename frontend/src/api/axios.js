import axios from "axios";

const api = axios.create({
  baseURL: "https://smit-final-hackathon-backend-nu.vercel.app/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
