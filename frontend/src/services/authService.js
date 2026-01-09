import { api } from "../api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./authStorage";

let authPromise = null;

const decodeBase64 = (value) => {
  if (typeof atob === "function") {
    return atob(value);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64").toString("utf-8");
  }
  return "";
};

const decodeJwtPayload = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  try {
    return JSON.parse(decodeBase64(padded));
  } catch {
    return null;
  }
};

const isTokenExpired = (token, bufferSeconds = 60) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - bufferSeconds <= now;
};

export const ensureAuthToken = async (clientId) => {
  const existing = getAuthToken();
  if (existing && !isTokenExpired(existing)) return existing;
  if (existing) clearAuthToken();
  if (!clientId) {
    throw new Error("Client ID is required for authentication");
  }

  if (!authPromise) {
    authPromise = api
      .post("/auth/guest", { clientId })
      .then((response) => {
        const token = response.data?.token;
        if (!token) {
          throw new Error("Missing auth token");
        }
        setAuthToken(token);
        return token;
      })
      .finally(() => {
        authPromise = null;
      });
  }

  return authPromise;
};
