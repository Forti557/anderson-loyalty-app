const API_URL = import.meta.env.VITE_API_URL || "";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("admin_token", token);
  else localStorage.removeItem("admin_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function api<T = any>(
  path: string,
  options: { method?: string; body?: any } = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/v1/admin${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 || res.status === 403) {
    setToken(null);
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json.data;
}

// Generic API fetch (not prefixed with /admin)
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    setToken(null);
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json.data;
}

export async function login(password: string): Promise<string> {
  const data = await api<{ token: string }>("/login", {
    method: "POST",
    body: { password },
  });
  setToken(data.token);
  return data.token;
}
