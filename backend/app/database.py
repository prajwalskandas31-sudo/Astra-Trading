from collections.abc import Generator
from datetime import datetime, timezone
import os
from sqlmodel import Session, SQLModel, create_engine, select
from app.models import SuperAdmin, User, BrokerStatusEnum, AuditLog
from app.security import hash_password, encrypt_broker_credentials

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./astra_trading.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
)


def get_session() -> Generator[Session, None, None]:
    """Dependency that yields a database session."""
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """Create tables and seed initial data if necessary."""
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Check if default Super Admin exists
        admin = session.exec(select(SuperAdmin).where(SuperAdmin.username == "admin")).first()
        if not admin:
            admin = SuperAdmin(
                username="admin",
                email="admin@astratrading.com",
                hashed_password=hash_password("Admin@123456"),
                full_name="Astra Trading Super Admin",
            )
            session.add(admin)
            session.commit()
            session.refresh(admin)

            # Log system initialization
            session.add(
                AuditLog(
                    action="SYSTEM_INITIALIZATION",
                    user_id=None,
                    user_name="System",
                    details="Super Admin Terminal initialized. Default admin credential provisioned.",
                    severity="success",
                )
            )

            # Seed realistic users representing key states from input.md
            demo_users = [
                User(
                    name="Rajesh Sharma",
                    phone_number="+91 98765 43210",
                    broker_name="Zerodha Kite",
                    broker_code="zerodha",
                    broker_client_id="ZR8921",
                    broker_status=BrokerStatusEnum.CONNECTED.value,
                    broker_last_sync=datetime.now(timezone.utc),
                    broker_auth_message="OAuth token verified. Session active.",
                    encrypted_broker_credentials=encrypt_broker_credentials({
                        "api_key": "kite_live_key_982",
                        "api_secret": "kite_secret_9918",
                        "auth_token": "enctoken_981a7b6c5d4e",
                    }),
                    is_active=True,
                    live_orders_enabled=True,
                    whatsapp_alerts_enabled=True,
                    telegram_alerts_enabled=True,
                    telegram_chat_id="@rajesh_trader",
                    notes="Nifty options momentum strategy user.",
                ),
                User(
                    name="Pooja Patel",
                    phone_number="+91 98223 11223",
                    broker_name="Angel One",
                    broker_code="angelone",
                    broker_client_id="ANG9041",
                    broker_status=BrokerStatusEnum.CONNECTED.value,
                    broker_last_sync=datetime.now(timezone.utc),
                    broker_auth_message="SmartAPI JWT active. TOTP verified.",
                    encrypted_broker_credentials=encrypt_broker_credentials({
                        "api_key": "angel_key_771",
                        "auth_token": "jwt_token_88203",
                    }),
                    is_active=True,
                    live_orders_enabled=False,  # Default off
                    whatsapp_alerts_enabled=True,
                    telegram_alerts_enabled=False,
                    notes="BankNifty buyer. Live orders pending risk signoff.",
                ),
                User(
                    name="Vikram Verma",
                    phone_number="+91 91234 56789",
                    broker_name="Upstox",
                    broker_code="upstox",
                    broker_client_id="UP88231",
                    broker_status=BrokerStatusEnum.REQUIRES_REAUTHORIZATION.value,
                    broker_last_sync=datetime.now(timezone.utc),
                    broker_auth_message="Access token expired at 06:00 AM. Requires reauthorization.",
                    encrypted_broker_credentials=encrypt_broker_credentials({
                        "api_key": "upstox_api_key_441",
                    }),
                    is_active=True,
                    live_orders_enabled=False,
                    whatsapp_alerts_enabled=False,
                    telegram_alerts_enabled=True,
                    telegram_chat_id="@vikram_v",
                    notes="Daily token renewal required.",
                ),
                User(
                    name="Ananya Sen",
                    phone_number="+91 97654 32109",
                    broker_name="Dhan",
                    broker_code="dhan",
                    broker_client_id="DHAN502",
                    broker_status=BrokerStatusEnum.DISCONNECTED.value,
                    broker_last_sync=None,
                    broker_auth_message="Broker account not yet connected.",
                    encrypted_broker_credentials=None,
                    is_active=False,  # Access revoked
                    live_orders_enabled=False,
                    whatsapp_alerts_enabled=False,
                    telegram_alerts_enabled=False,
                    notes="Access temporarily revoked pending KYC audit.",
                ),
                User(
                    name="Karthik Iyer",
                    phone_number="+91 99887 76655",
                    broker_name="Fyers",
                    broker_code="fyers",
                    broker_client_id="FY9902",
                    broker_status=BrokerStatusEnum.CONNECTED.value,
                    broker_last_sync=datetime.now(timezone.utc),
                    broker_auth_message="Fyers API V3 connected.",
                    encrypted_broker_credentials=encrypt_broker_credentials({
                        "api_key": "fyers_app_id_12",
                        "auth_token": "fyers_token_3321",
                    }),
                    is_active=True,
                    live_orders_enabled=False,
                    whatsapp_alerts_enabled=True,
                    telegram_alerts_enabled=True,
                    telegram_chat_id="@karthik_iyer",
                    notes="High-frequency scalping candidate.",
                ),
            ]

            for user in demo_users:
                session.add(user)
            session.commit()
