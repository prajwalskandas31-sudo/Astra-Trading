export type BrokerStatus = "Connected" | "Disconnected" | "Requires Reauthorization";

export interface SuperAdmin {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

export interface User {
  id: number;
  name: string;
  phone_number: string;
  broker_name: string;
  broker_code: string;
  broker_client_id: string;
  broker_status: BrokerStatus;
  broker_last_sync: string | null;
  broker_auth_message: string | null;
  has_broker_credentials: boolean;
  is_active: boolean;
  live_orders_enabled: boolean;
  whatsapp_alerts_enabled: boolean;
  telegram_alerts_enabled: boolean;
  telegram_chat_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrokerInfo {
  code: string;
  name: string;
  icon_name: string;
  auth_type: string;
  required_fields: string[];
  description: string;
  reauth_policy: string;
}

export interface BrokerVerifyResponse {
  success: boolean;
  status: BrokerStatus;
  message: string;
  latency_ms: number;
  broker_user_profile?: {
    broker: string;
    client_id: string;
    exchange_segments: string[];
    order_placement_allowed: boolean;
    token_valid_until: string;
  };
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  revoked_users: number;
  live_orders_active: number;
  broker_connected: number;
  broker_reauth: number;
  broker_disconnected: number;
  whatsapp_alerts_active: number;
  telegram_alerts_active: number;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  user_id: number | null;
  user_name: string | null;
  details: string;
  severity: "info" | "success" | "warning" | "danger";
}

export interface OrderSimulateResponse {
  allowed: boolean;
  status: string;
  reason: string;
  user_id: number;
  user_name: string;
  execution_time: string;
  details: {
    order_id?: string;
    symbol: string;
    side: string;
    quantity: number;
    price?: number;
    broker?: string;
    client_id?: string;
  };
}
