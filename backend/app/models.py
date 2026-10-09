from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class BrokerStatusEnum(str, Enum):
    CONNECTED = "Connected"
    DISCONNECTED = "Disconnected"
    REQUIRES_REAUTHORIZATION = "Requires Reauthorization"


class SuperAdmin(SQLModel, table=True):
    __tablename__ = "super_admins"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: str = "Super Admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    phone_number: str = Field(index=True)
    broker_name: str = Field(default="Zerodha Kite")
    broker_code: str = Field(default="zerodha")
    broker_client_id: str = Field(default="")
    
    # Broker connection state: Connected, Disconnected, Requires Reauthorization
    broker_status: str = Field(default=BrokerStatusEnum.DISCONNECTED.value)
    broker_last_sync: Optional[datetime] = None
    broker_auth_message: Optional[str] = "Account created. Awaiting broker authorization."
    
    # Sensitive credentials are stored encrypted via Fernet and never sent to clients
    encrypted_broker_credentials: Optional[str] = None
    
    # User access control: Active / Revoked
    is_active: bool = Field(default=True)
    
    # Live Order Placement: ON / OFF (Must default to False for safety)
    live_orders_enabled: bool = Field(default=False)
    
    # Independent Notification Alerts: ON / OFF
    whatsapp_alerts_enabled: bool = Field(default=False)
    telegram_alerts_enabled: bool = Field(default=False)
    telegram_chat_id: Optional[str] = None
    
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    action: str = Field(index=True)  # e.g., ORDER_TOGGLED, ACCESS_REVOKED, BROKER_CONNECTED
    user_id: Optional[int] = Field(default=None, index=True)
    user_name: Optional[str] = None
    details: str
    severity: str = Field(default="info")  # info, success, warning, danger
