from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Auth Schemas
# -------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "SuperAdminOut"


class SuperAdminOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str


# -------------------------------------------------------------
# Broker Schemas
# -------------------------------------------------------------
class BrokerInfo(BaseModel):
    code: str
    name: str
    icon_name: str
    auth_type: str  # "api_key_secret", "oauth2", "totp_pin", "smart_api"
    required_fields: list[str]
    description: str
    reauth_policy: str


class BrokerVerifyRequest(BaseModel):
    broker_code: str
    client_id: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    auth_token: Optional[str] = None
    totp_pin: Optional[str] = None


class BrokerVerifyResponse(BaseModel):
    success: bool
    status: str  # "Connected", "Disconnected", "Requires Reauthorization"
    message: str
    latency_ms: int
    broker_user_profile: Optional[dict] = None


# -------------------------------------------------------------
# User Schemas
# -------------------------------------------------------------
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone_number: str = Field(min_length=7, max_length=20)
    broker_code: str
    broker_client_id: str
    broker_api_key: Optional[str] = None
    broker_api_secret: Optional[str] = None
    broker_auth_token: Optional[str] = None
    broker_totp_pin: Optional[str] = None
    
    # Live Order Placement: default must be False
    live_orders_enabled: bool = False
    
    # Independent notification alerts
    whatsapp_alerts_enabled: bool = False
    telegram_alerts_enabled: bool = False
    telegram_chat_id: Optional[str] = None
    notes: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    broker_code: Optional[str] = None
    broker_client_id: Optional[str] = None
    broker_api_key: Optional[str] = None
    broker_api_secret: Optional[str] = None
    broker_auth_token: Optional[str] = None
    broker_totp_pin: Optional[str] = None
    live_orders_enabled: Optional[bool] = None
    whatsapp_alerts_enabled: Optional[bool] = None
    telegram_alerts_enabled: Optional[bool] = None
    telegram_chat_id: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    phone_number: str
    broker_name: str
    broker_code: str
    broker_client_id: str
    broker_status: str
    broker_last_sync: Optional[datetime] = None
    broker_auth_message: Optional[str] = None
    has_broker_credentials: bool
    is_active: bool
    live_orders_enabled: bool
    whatsapp_alerts_enabled: bool
    telegram_alerts_enabled: bool
    telegram_chat_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ToggleLiveOrdersRequest(BaseModel):
    live_orders_enabled: bool


class ToggleAlertsRequest(BaseModel):
    whatsapp_alerts_enabled: Optional[bool] = None
    telegram_alerts_enabled: Optional[bool] = None


class ToggleAccessRequest(BaseModel):
    is_active: bool


class TestAlertRequest(BaseModel):
    channel: str  # "whatsapp" or "telegram"
    custom_message: Optional[str] = None


# -------------------------------------------------------------
# Order Simulation Schemas
# -------------------------------------------------------------
class OrderSimulateRequest(BaseModel):
    user_id: int
    symbol: str
    quantity: int = Field(gt=0)
    side: str = Field(pattern="^(BUY|SELL)$")
    order_type: str = "MARKET"
    price: Optional[float] = None


class OrderSimulateResponse(BaseModel):
    allowed: bool
    status: str
    reason: str
    user_id: int
    user_name: str
    execution_time: datetime
    details: dict


# -------------------------------------------------------------
# Dashboard & Audit Schemas
# -------------------------------------------------------------
class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    revoked_users: int
    live_orders_active: int
    broker_connected: int
    broker_reauth: int
    broker_disconnected: int
    whatsapp_alerts_active: int
    telegram_alerts_active: int


class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime
    action: str
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    details: str
    severity: str
