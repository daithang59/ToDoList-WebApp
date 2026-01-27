import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// Create axios instance for authenticated requests
const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Token management keys
const TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";
const GUEST_ID_KEY = "guest_id";

// Request interceptor to add auth token
authAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authAxios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token, user needs to login again
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        saveToken(accessToken);
        saveRefreshToken(newRefreshToken);

        authAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return authAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Register a new user account
 */
export async function register(name, email, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    name,
    email,
    password,
  });

  return response.data;
}

/**
 * Login with email and password
 */
export async function login(email, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });

  return response.data;
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  return response.data;
}

/**
 * Logout (revoke refresh token)
 */
export async function logout(refreshToken) {
  try {
    await axios.post(`${API_BASE_URL}/auth/logout`, {
      refreshToken,
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Continue with client-side logout even if server request fails
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const response = await authAxios.get(`${API_BASE_URL}/auth/me`);
  return response.data;
}

/**
 * Request password reset
 */
export async function forgotPassword(email) {
  const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
    email,
  });

  return response.data;
}

/**
 * Reset password with token
 */
export async function resetPassword(token, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
    token,
    password,
  });

  return response.data;
}

/**
 * Verify email with token
 */
export async function verifyEmail(token) {
  const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
    token,
  });

  return response.data;
}

/**
 * Resend verification email
 */
export async function resendVerification() {
  const response = await authAxios.post(
    `${API_BASE_URL}/auth/resend-verification`
  );

  return response.data;
}

/**
 * Get guest token
 */
export async function getGuestToken(clientId) {
  const response = await axios.post(`${API_BASE_URL}/auth/guest`, {
    clientId,
  });

  return response.data;
}

/**
 * Migrate guest data to user account
 */
export async function migrateGuestData(guestOwnerId) {
  const response = await authAxios.post(
    `${API_BASE_URL}/auth/migrate-guest-data`,
    { guestOwnerId }
  );

  return response.data;
}

// ==================== Token Management ====================

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function removeRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function removeUser() {
  localStorage.removeItem(USER_KEY);
}

export function saveGuestId(guestId) {
  localStorage.setItem(GUEST_ID_KEY, guestId);
}

export function getGuestId() {
  return localStorage.getItem(GUEST_ID_KEY);
}

export function removeGuestId() {
  localStorage.removeItem(GUEST_ID_KEY);
}

export function clearAuth() {
  removeToken();
  removeRefreshToken();
  removeUser();
}

export default authAxios;
