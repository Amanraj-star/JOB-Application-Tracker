const BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("jt_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  listApplications: () => request("/applications"),
  stats: () => request("/applications/stats"),
  createApplication: (payload) => request("/applications", { method: "POST", body: payload }),
  updateApplication: (id, payload) => request(`/applications/${id}`, { method: "PUT", body: payload }),
  moveApplication: (id, payload) => request(`/applications/${id}/move`, { method: "PATCH", body: payload }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: "DELETE" }),
};
