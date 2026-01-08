import { api } from "../api";
import { getAuthToken, setAuthToken } from "./authStorage";

let authPromise = null;

export const ensureAuthToken = async (clientId) => {
  const existing = getAuthToken();
  if (existing) return existing;
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
