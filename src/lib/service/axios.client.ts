import axios from "axios";
import Cookies from "js-cookie";
import { ENDPOINTS } from "./endpoints";

const baseURL = (process.env.NEXT_PUBLIC_API_URL || "https://hitha-server.beetlecode.com/api/v1").replace(/\/$/, "");

const getLoginRedirectPath = () => {
  if (typeof window === "undefined") return "/";
  if (window.location.pathname.startsWith("/admin")) return "/admin/login";
  if (window.location.pathname.startsWith("/doctor")) return "/doctor/login";
  return "/";
};

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accesstoken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables for concurrent refresh queue
let isRefreshing = false;
interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Central Auth-Failure (401 & 403) & Token Refresh Handler
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Skip refresh for auth endpoints to prevent loops
    const AUTH_ENDPOINTS_WITHOUT_REDIRECT = [
      ENDPOINTS.auth.refresh,
      ENDPOINTS.admin.login,
      ENDPOINTS.doctor.login,
    ];
    if (originalRequest && AUTH_ENDPOINTS_WITHOUT_REDIRECT.includes(originalRequest.url)) {
      return Promise.reject(error);
    }

    // 2. Handle Unauthorized/Forbidden (backend returns 403 for invalidated tokens too)
    const isAuthFailure = error.response?.status === 401 || error.response?.status === 403;
    if (isAuthFailure && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until the current refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenAtStart = Cookies.get("refreshtoken");
      if (!refreshTokenAtStart) {
        Cookies.remove("accesstoken");
        Cookies.remove("refreshtoken");
        if (typeof window !== "undefined") {
          window.location.href = getLoginRedirectPath();
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}${ENDPOINTS.auth.refresh}`, {
          refreshToken: refreshTokenAtStart,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Discard if the active session changed during the network call
        if (Cookies.get("refreshtoken") !== refreshTokenAtStart) {
          processQueue(error, null);
          return Promise.reject(error);
        }

        Cookies.set("accesstoken", accessToken, { expires: 1 });
        Cookies.set("refreshtoken", newRefreshToken, { expires: 7 });

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (Cookies.get("refreshtoken") === refreshTokenAtStart) {
          Cookies.remove("accesstoken");
          Cookies.remove("refreshtoken");
          if (typeof window !== "undefined") {
            window.location.href = getLoginRedirectPath();
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
