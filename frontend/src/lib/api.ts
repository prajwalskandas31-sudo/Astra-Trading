import {
  AuditLog,
  BrokerInfo,
  BrokerVerifyResponse,
  DashboardStats,
  OrderSimulateResponse,
  SuperAdmin,
  User,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8000" : "https://astra-algo.onrender.com");

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("astra_admin_token") || localStorage.getItem("srini_admin_token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    if (typeof window !== "undefined" && !endpoint.includes("/api/auth/login")) {
      localStorage.removeItem("astra_admin_token");
      localStorage.removeItem("srini_admin_token");
      localStorage.removeItem("astra_admin_user");
      localStorage.removeItem("srini_admin_user");
      window.dispatchEvent(new Event("auth-expired"));
    }
  }

  if (!res.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = res.statusText;
    }
    throw new Error(errorDetail);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// ----------------------------------------------------------------------
// Auth Endpoints
// ----------------------------------------------------------------------
export async function login(username: string, password: string):Promise<{ access_token: string; user: SuperAdmin }> {
  return request<{ access_token: string; user: SuperAdmin }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getMe(): Promise<SuperAdmin> {
  return request<SuperAdmin>("/api/auth/me");
}

// ----------------------------------------------------------------------
// Users Endpoints
// ----------------------------------------------------------------------
export interface UserFilterParams {
  search?: string;
  status?: string;
  is_active?: boolean;
  live_orders?: boolean;
}

export async function getUsers(filters?: UserFilterParams): Promise<User[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.is_active !== undefined) params.append("is_active", String(filters.is_active));
  if (filters?.live_orders !== undefined) params.append("live_orders", String(filters.live_orders));

  const qs = params.toString() ? `?${params.toString()}` : "";
  return request<User[]>(`/api/users${qs}`);
}

export async function getUser(id: number): Promise<User> {
  return request<User>(`/api/users/${id}`);
}

export async function createUser(payload: {
  name: string;
  phone_number: string;
  broker_code: string;
  broker_client_id: string;
  broker_api_key?: string;
  broker_api_secret?: string;
  broker_auth_token?: string;
  broker_totp_pin?: string;
  live_orders_enabled?: boolean;
  whatsapp_alerts_enabled?: boolean;
  telegram_alerts_enabled?: boolean;
  telegram_chat_id?: string;
  notes?: string;
}): Promise<User> {
  return request<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  id: number,
  payload: Partial<User> & {
    broker_api_key?: string;
    broker_api_secret?: string;
    broker_auth_token?: string;
    broker_totp_pin?: string;
  }
): Promise<User> {
  return request<User>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: number): Promise<void> {
  return request<void>(`/api/users/${id}`, {
    method: "DELETE",
  });
}

export async function toggleLiveOrders(id: number, live_orders_enabled: boolean): Promise<User> {
  return request<User>(`/api/users/${id}/toggle-live-orders`, {
    method: "POST",
    body: JSON.stringify({ live_orders_enabled }),
  });
}

export async function toggleWhatsApp(id: number): Promise<User> {
  return request<User>(`/api/users/${id}/toggle-whatsapp`, {
    method: "POST",
  });
}

export async function toggleTelegram(id: number): Promise<User> {
  return request<User>(`/api/users/${id}/toggle-telegram`, {
    method: "POST",
  });
}

export async function toggleUserAccess(id: number, is_active: boolean): Promise<User> {
  return request<User>(`/api/users/${id}/toggle-access`, {
    method: "POST",
    body: JSON.stringify({ is_active }),
  });
}

export async function reauthorizeBroker(id: number): Promise<User> {
  return request<User>(`/api/users/${id}/reauthorize-broker`, {
    method: "POST",
  });
}

export async function sendTestAlert(id: number, channel: "whatsapp" | "telegram", customMessage?: string): Promise<{ success: boolean; message: string; channel: string }> {
  return request<{ success: boolean; message: string; channel: string }>(`/api/users/${id}/test-alert`, {
    method: "POST",
    body: JSON.stringify({ channel, custom_message: customMessage }),
  });
}

// ----------------------------------------------------------------------
// Brokers Endpoints
// ----------------------------------------------------------------------
export async function getSupportedBrokers(): Promise<BrokerInfo[]> {
  return request<BrokerInfo[]>("/api/brokers");
}

export async function verifyBroker(payload: {
  broker_code: string;
  client_id: string;
  api_key?: string;
  api_secret?: string;
  auth_token?: string;
  totp_pin?: string;
}): Promise<BrokerVerifyResponse> {
  return request<BrokerVerifyResponse>("/api/brokers/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----------------------------------------------------------------------
// Orders Endpoints
// ----------------------------------------------------------------------
export async function simulateOrder(payload: {
  user_id: number;
  symbol: string;
  quantity: number;
  side: "BUY" | "SELL";
  order_type?: string;
  price?: number;
}): Promise<OrderSimulateResponse> {
  return request<OrderSimulateResponse>("/api/orders/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ----------------------------------------------------------------------
// Dashboard Endpoints
// ----------------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/api/dashboard/stats");
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  return request<AuditLog[]>(`/api/dashboard/audit-logs?limit=${limit}`);
}
