const configuredApiUrl = import.meta.env.VITE_API_URL;
const apiUrl =
  configuredApiUrl ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "");
const normalizedApiUrl = apiUrl.replace(/\/+$/, "");
const API_URL =
  normalizedApiUrl && /\/api$/i.test(normalizedApiUrl)
    ? normalizedApiUrl
    : normalizedApiUrl
      ? `${normalizedApiUrl}/api`
      : "";

export const apiRequest = async (endpoint, options = {}) => {
  if (!API_URL) {
    throw new Error("The backend API URL is not configured.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    error.reason = data.reason;
    error.attemptsRemaining = data.attemptsRemaining;
    throw error;
  }

  return data;
};