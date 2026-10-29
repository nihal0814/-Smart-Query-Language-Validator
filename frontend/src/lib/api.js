// Small fetch wrapper around the FastAPI backend.
// Base URL comes from Vite env var VITE_API_URL, falling back to localhost
// for local development (see .env.example).

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => get("/health"),
  validate: (query) => post("/api/validate", { query }),
  tokenize: (query) => post("/api/tokenize", { query }),
  dfaCheck: (value, kind) => post("/api/dfa-check", { value, kind }),
};

export const API_BASE_URL = BASE_URL;
