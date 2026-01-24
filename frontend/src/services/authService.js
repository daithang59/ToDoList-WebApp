import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

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
export async function login(email, password, rememberMe = false) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
    rememberMe,
  });
  
  return response.data;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(token) {
  const response = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
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
export async function migrateGuestData(token, guestOwnerId) {
  const response = await axios.post(
    `${API_BASE_URL}/auth/migrate-guest-data`,
    { guestOwnerId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
}

// Token management
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const GUEST_ID_KEY = "guest_id";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
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
  removeUser();
}
