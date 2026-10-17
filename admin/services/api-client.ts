import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  timeout: 60000,
  withCredentials: true, // Include cookies with requests
});

// Attach Bearer token from localStorage (set by useAuthStore)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/admin/login";
    }
    if (error.response?.status === 403 && typeof window !== "undefined") {
      // Forbidden - insufficient role permissions
      window.location.href = "/admin?error=forbidden";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
