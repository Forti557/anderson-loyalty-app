import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

interface AuthState {
  loading: boolean;
  token: string | null;
  userId: string | null;
  registered: boolean;
}

interface AuthContextType extends AuthState {
  // SMS OTP flow
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<{ registered: boolean; tempToken?: string; phone?: string }>;
  // Registration after OTP
  register: (formData: Record<string, any>) => Promise<void>;
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loading: true,
    token: localStorage.getItem("anderson_token"),
    userId: localStorage.getItem("anderson_user_id"),
    registered: !!localStorage.getItem("anderson_token"),
  });

  const apiFetch = useCallback(
    async (path: string, opts: RequestInit = {}) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(opts.headers as Record<string, string>),
      };
      if (state.token) {
        headers["Authorization"] = `Bearer ${state.token}`;
      }
      const res = await fetch(`${API_URL}/api/v1${path}`, { ...opts, headers });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "API error");
      return data.data;
    },
    [state.token],
  );

  // On mount: validate token against server
  useEffect(() => {
    const token = localStorage.getItem("anderson_token");
    const userId = localStorage.getItem("anderson_user_id");

    if (!token || !userId) {
      setState({ loading: false, token: null, userId: null, registered: false });
      return;
    }

    // Verify token is still valid by hitting a protected endpoint
    fetch(`${API_URL}/api/v1/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          // Token invalid/expired — clear and show login
          localStorage.removeItem("anderson_token");
          localStorage.removeItem("anderson_user_id");
          setState({ loading: false, token: null, userId: null, registered: false });
        } else {
          setState({ loading: false, token, userId, registered: true });
        }
      })
      .catch(() => {
        // Network error — trust cached token (offline mode)
        setState({ loading: false, token, userId, registered: true });
      });
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Не удалось отправить код");
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Неверный код");

    if (json.data.registered) {
      // Existing user — save token and go to main screen
      localStorage.setItem("anderson_token", json.data.token);
      localStorage.setItem("anderson_user_id", json.data.user.id);
      setState({
        loading: false,
        token: json.data.token,
        userId: json.data.user.id,
        registered: true,
      });
    }

    return {
      registered: json.data.registered,
      tempToken: json.data.tempToken,
      phone: json.data.phone,
    };
  }, []);

  const register = useCallback(async (formData: Record<string, any>) => {
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Ошибка регистрации");

    localStorage.setItem("anderson_token", json.data.token);
    localStorage.setItem("anderson_user_id", json.data.user.id);
    setState({
      loading: false,
      token: json.data.token,
      userId: json.data.user.id,
      registered: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("anderson_token");
    localStorage.removeItem("anderson_user_id");
    setState({ loading: false, token: null, userId: null, registered: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, sendOtp, verifyOtp, register, apiFetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
