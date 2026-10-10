import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("API tidak memberikan response:", error.message);
    } else {
      console.error("API request error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
