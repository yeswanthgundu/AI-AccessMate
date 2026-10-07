import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessmate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/user/profile"),
  updatePreferences: (prefs) => api.put("/user/preferences", prefs),
};

// History Service
export const historyService = {
  getHistory: () => api.get("/history"),
  deleteItem: (id) => api.delete(`/history/${id}`),
};

// AI Service
export const aiService = {
  simplify: (data) => api.post("/ai/simplify", data),
  translate: (data) => api.post("/ai/translate", data),
  document: (data) => api.post("/ai/document", data),
  scamCheck: (data) => api.post("/ai/scam-check", data),
  analyzeImage: (data) => api.post("/ai/image", data),
  uploadImage: (formData) =>
    api.post("/ai/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  lecture: (data) => api.post("/ai/lecture", data),
  accessibilityCheck: (data) => api.post("/ai/accessibility-check", data),
  explainWord: (data) => api.post("/ai/explain-word", data),
  urlSimplify: (data) => api.post("/ai/url", data),
  ask: (data) => api.post("/ai/ask", data),
};
