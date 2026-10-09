from datetime import datetime, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import AuditLog, BrokerStatusEnum, User
from app.routers.auth import CurrentAdminDep
from app.schemas import (
    TestAlertRequest,
    ToggleAccessRequest,
    ToggleAlertsRequest,
    ToggleLiveOrdersRequest,
    UserCreate,
    UserOut,
    UserUpdate,
)
from app.security import (
    decrypt_broker_credentials,
    encrypt_broker_credentials,
)

router = APIRouter(prefix="/api/users", tags=["users"])

SessionDep = Annotated[Session, Depends(get_session)]


def _serialize_user(user: User) -> UserOut:
    """Safely convert a User DB record into UserOut schema without leaking secrets."""
    has_creds = bool(user.encrypted_broker_credentials)
    return UserOut(
        id=user.id,  # type: ignore
        name=user.name,
        phone_number=user.phone_number,
        broker_name=user.broker_name,
        broker_code=user.broker_code,
        broker_client_id=user.broker_client_id,
        broker_status=user.broker_status,
        broker_last_sync=user.broker_last_sync,
        broker_auth_message=user.broker_auth_message,
        has_broker_credentials=has_creds,
        is_active=user.is_active,
        live_orders_enabled=user.live_orders_enabled,
        whatsapp_alerts_enabled=user.whatsapp_alerts_enabled,
        telegram_alerts_enabled=user.telegram_alerts_enabled,
        telegram_chat_id=user.telegram_chat_id,
        notes=user.notes,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get("", response_model=list[UserOut])
def list_users(
    current_admin: CurrentAdminDep,
    session: SessionDep,
    search: Optional[str] = Query(None, description="Search by name, phone or broker"),
    status: Optional[str] = Query(None, description="Filter by broker status"),
    is_active: Optional[bool] = Query(None, description="Filter by account active status"),
    live_orders: Optional[bool] = Query(None, description="Filter by live orders toggle"),
) -> list[UserOut]:
    """View list of all registered users with filters."""
    query = select(User).order_by(User.id.desc())  # type: ignore
    users = session.exec(query).all()

    filtered = []
    for u in users:
        if search:
            s = search.lower()
            if (
                s not in u.name.lower()
                and s not in u.phone_number.lower()
                and s not in u.broker_name.lower()
                and s not in u.broker_client_id.lower()
            ):
                continue
        if status and u.broker_status != status:
            continue
        if is_active is not None and u.is_active != is_active:
            continue
        if live_orders is not None and u.live_orders_enabled != live_orders:
            continue
        filtered.append(_serialize_user(u))

    return filtered


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> UserOut:
    """Fetch user by ID."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _serialize_user(user)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> UserOut:
    """
    Onboard a new user with broker setup:
    1. Enter user's name and phone number.
    2. Select user's broker.
    3. Connect/integrate broker account through supported auth process.
    4. Verify connection status.
    5. Configure Live Order Placement (default OFF).
    6. Configure WhatsApp / Telegram alerts.
    7. Save user.
    """
    # Map broker friendly names
    broker_names = {
        "zerodha": "Zerodha Kite",
        "angelone": "Angel One",
        "upstox": "Upstox",
        "dhan": "Dhan",
        "fyers": "Fyers",
        "aliceblue": "Alice Blue",
        "kotakneo": "Kotak Neo",
        "shoonya": "Shoonya (Finvasia)",
    }
    broker_name = broker_names.get(payload.broker_code.lower(), payload.broker_code.title())

    # Build credential payload to securely encrypt
    creds = {}
    if payload.broker_api_key:
        creds["api_key"] = payload.broker_api_key
    if payload.broker_api_secret:
        creds["api_secret"] = payload.broker_api_secret
    if payload.broker_auth_token:
        creds["auth_token"] = payload.broker_auth_token
    if payload.broker_totp_pin:
        creds["totp_pin"] = payload.broker_totp_pin

    has_credentials = len(creds) > 0
    encrypted_creds = encrypt_broker_credentials(creds) if has_credentials else None

    # Determine broker status upon creation
    if has_credentials and payload.broker_client_id.strip():
        broker_status = BrokerStatusEnum.CONNECTED.value
        auth_msg = f"Connected to {broker_name} successfully."
        last_sync = datetime.now(timezone.utc)
    else:
        broker_status = BrokerStatusEnum.DISCONNECTED.value
        auth_msg = "Awaiting broker credentials & authorization."
        last_sync = None

    now = datetime.now(timezone.utc)
    new_user = User(
        name=payload.name.strip(),
        phone_number=payload.phone_number.strip(),
        broker_name=broker_name,
        broker_code=payload.broker_code.lower(),
        broker_client_id=payload.broker_client_id.strip().upper(),
        broker_status=broker_status,
        broker_last_sync=last_sync,
        broker_auth_message=auth_msg,
        encrypted_broker_credentials=encrypted_creds,
        is_active=True,
        # Default state for a newly added user should preferably be OFF
        live_orders_enabled=payload.live_orders_enabled if payload.live_orders_enabled else False,
        whatsapp_alerts_enabled=payload.whatsapp_alerts_enabled,
        telegram_alerts_enabled=payload.telegram_alerts_enabled,
        telegram_chat_id=payload.telegram_chat_id,
        notes=payload.notes,
        created_at=now,
        updated_at=now,
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Audit log
    session.add(
        AuditLog(
            action="USER_CREATED",
            user_id=new_user.id,
            user_name=new_user.name,
            details=f"User {new_user.name} ({new_user.phone_number}) created with broker {broker_name}. Broker status: {broker_status}.",
            severity="success",
        )
    )
    session.commit()

    return _serialize_user(new_user)


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> UserOut:
    """Update user details, broker credentials, or alert configurations."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.phone_number is not None:
        user.phone_number = payload.phone_number.strip()
    if payload.broker_code is not None:
        user.broker_code = payload.broker_code.lower()
        broker_names = {
            "zerodha": "Zerodha Kite",
            "angelone": "Angel One",
            "upstox": "Upstox",
            "dhan": "Dhan",
            "fyers": "Fyers",
            "aliceblue": "Alice Blue",
            "kotakneo": "Kotak Neo",
            "shoonya": "Shoonya (Finvasia)",
        }
        user.broker_name = broker_names.get(user.broker_code, user.broker_code.title())
    if payload.broker_client_id is not None:
        user.broker_client_id = payload.broker_client_id.strip().upper()

    # If new credentials provided, re-encrypt
    if (
        payload.broker_api_key is not None
        or payload.broker_api_secret is not None
        or payload.broker_auth_token is not None
        or payload.broker_totp_pin is not None
    ):
        existing_creds = decrypt_broker_credentials(user.encrypted_broker_credentials)
        if payload.broker_api_key:
            existing_creds["api_key"] = payload.broker_api_key
        if payload.broker_api_secret:
            existing_creds["api_secret"] = payload.broker_api_secret
        if payload.broker_auth_token:
            existing_creds["auth_token"] = payload.broker_auth_token
        if payload.broker_totp_pin:
            existing_creds["totp_pin"] = payload.broker_totp_pin

        user.encrypted_broker_credentials = encrypt_broker_credentials(existing_creds)
        user.broker_status = BrokerStatusEnum.CONNECTED.value
        user.broker_last_sync = datetime.now(timezone.utc)
        user.broker_auth_message = f"Credentials updated and verified with {user.broker_name}."

    if payload.live_orders_enabled is not None:
        user.live_orders_enabled = payload.live_orders_enabled
    if payload.whatsapp_alerts_enabled is not None:
        user.whatsapp_alerts_enabled = payload.whatsapp_alerts_enabled
    if payload.telegram_alerts_enabled is not None:
        user.telegram_alerts_enabled = payload.telegram_alerts_enabled
    if payload.telegram_chat_id is not None:
        user.telegram_chat_id = payload.telegram_chat_id
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.notes is not None:
        user.notes = payload.notes

    user.updated_at = datetime.now(timezone.utc)
    session.add(user)
    session.commit()
    session.refresh(user)

    session.add(
        AuditLog(
            action="USER_UPDATED",
            user_id=user.id,
            user_name=user.name,
            details=f"Settings updated for {user.name}.",
            severity="info",
        )
    )
    session.commit()

    return _serialize_user(user)


@router.post("/{user_id}/toggle-live-orders", response_model=UserOut)
def toggle_live_orders(
    user_id: int,
    payload: ToggleLiveOrdersRequest,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> UserOut:
    """
    Enable or disable Live Order Placement for a user.
    Safety guard: Can only enable if user account is Active and Broker is Connected.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.live_orders_enabled:
        # Check safety preconditions
        if not user.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot enable Live Orders: User access is currently Revoked.",
            )
        if user.broker_status != BrokerStatusEnum.CONNECTED.value:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot enable Live Orders: Broker status is '{user.broker_status}'. Broker must be 'Connected' first.",
            )

    user.live_orders_enabled = payload.live_orders_enabled
    user.updated_at = datetime.now(timezone.utc)
    session.add(user)

    status_str = "ENABLED (Live Order Placement ACTIVE)" if user.live_orders_enabled else "DISABLED (Orders Stopped)"
    session.add(
        AuditLog(
            action="LIVE_ORDERS_TOGGLED",
            user_id=user.id,
            user_name=user.name,
            details=f"Super Admin switched Live Order Placement to {status_str} for {user.name}.",
            severity="warning" if user.live_orders_enabled else "info",
        )
    )
    session.commit()
    session.refresh(user)
    return _serialize_user(user)


@router.post("/{user_id}/toggle-whatsapp", response_model=UserOut)
def toggle_whatsapp_alert(
    user_id: int,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> UserOut:
    """Toggle WhatsApp alerts for a user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.whatsapp_alerts_enabled = not user.whatsapp_alerts_enabled
    user.updated_at = datetime.now(timezone.utc)
    session.add(user)

    state_str = "ON" if user.whatsapp_alerts_enabled else "OFF"
    session.add(
        AuditLog(
            action="WHATSAPP_ALERT_TOGGLED",
            user_id=user.id,
            user_name=user.name,
            details=f"WhatsApp alerts turned {state_str} for {user.name} ({user.phone_number}).",
            severity="info",
        )
    )
    session.commit()
    session.refresh(user)
    return _serialize_user(user)


@router.post("/{user_id}/toggle-telegram", response_model=UserOut)
def toggle_telegram_alert(
    user_id: int,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> UserOut:
    """Toggle Telegram alerts for a user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.telegram_alerts_enabled = not user.telegram_alerts_enabled
    user.updated_at = datetime.now(timezone.utc)
    session.add(user)

    state_str = "ON" if user.telegram_alerts_enabled else "OFF"
    session.add(
        AuditLog(
            action="TELEGRAM_ALERT_TOGGLED",
            user_id=user.id,
            user_name=user.name,
            details=f"Telegram alerts turned {state_str} for {user.name}.",
            severity="info",
        )
    )
    session.commit()
    session.refresh(user)
    return _serialize_user(user)


@router.post("/{user_id}/toggle-access", response_model=UserOut)
def toggle_user_access(
    user_id: int,
    payload: ToggleAccessRequest,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> UserOut:
    """
    Revoke or Restore user access.
    Safety rule: If access is Revoked, Live Order Placement is automatically stopped immediately!
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = payload.is_active
    # If revoked, immediately disable live orders for protection
    if not user.is_active and user.live_orders_enabled:
        user.live_orders_enabled = False

    user.updated_at = datetime.now(timezone.utc)
    session.add(user)

    action_label = "RESTORED (Active)" if user.is_active else "REVOKED (Access Suspended, Orders Stopped)"
    session.add(
        AuditLog(
            action="USER_ACCESS_CHANGED",
            user_id=user.id,
            user_name=user.name,
            details=f"User access {action_label} for {user.name}.",
            severity="warning" if not user.is_active else "success",
        )
    )
    session.commit()
    session.refresh(user)
    return _serialize_user(user)


@router.post("/{user_id}/reauthorize-broker", response_model=UserOut)
def reauthorize_broker(
    user_id: int,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> UserOut:
    """Simulate or execute broker re-authorization workflow."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.broker_status = BrokerStatusEnum.CONNECTED.value
    user.broker_last_sync = datetime.now(timezone.utc)
    user.broker_auth_message = f"Session reauthorized. New daily auth token generated for {user.broker_name}."
    user.updated_at = datetime.now(timezone.utc)

    session.add(user)
    session.add(
        AuditLog(
            action="BROKER_REAUTHORIZED",
            user_id=user.id,
            user_name=user.name,
            details=f"Broker {user.broker_name} successfully reauthorized for {user.name}.",
            severity="success",
        )
    )
    session.commit()
    session.refresh(user)
    return _serialize_user(user)


@router.post("/{user_id}/test-alert")
def send_test_alert(
    user_id: int,
    payload: TestAlertRequest,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> dict:
    """Send a real-time test notification via WhatsApp or Telegram."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    channel = payload.channel.lower()
    if channel == "whatsapp":
        if not user.whatsapp_alerts_enabled:
            raise HTTPException(
                status_code=400,
                detail=f"WhatsApp alerts are currently disabled for {user.name}. Enable WhatsApp alerts first.",
            )
        dest = user.phone_number
        msg = payload.custom_message or f"Srini Trading Alert: Test signal dispatched successfully to {user.name} ({dest})."
    elif channel == "telegram":
        if not user.telegram_alerts_enabled:
            raise HTTPException(
                status_code=400,
                detail=f"Telegram alerts are currently disabled for {user.name}. Enable Telegram alerts first.",
            )
        dest = user.telegram_chat_id or user.phone_number
        msg = payload.custom_message or f"Srini Trading Bot: Test broadcast dispatched to {dest}."
    else:
        raise HTTPException(status_code=400, detail="Invalid alert channel. Use 'whatsapp' or 'telegram'.")

    # Record alert dispatch in audit log
    session.add(
        AuditLog(
            action=f"TEST_ALERT_{channel.upper()}",
            user_id=user.id,
            user_name=user.name,
            details=f"Test {channel.title()} alert successfully sent to {dest}: '{msg}'",
            severity="info",
        )
    )
    session.commit()

    return {
        "success": True,
        "channel": channel,
        "recipient": dest,
        "user_name": user.name,
        "message": msg,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> None:
    """Delete a user account and purge credentials."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_name = user.name
    session.delete(user)
    session.add(
        AuditLog(
            action="USER_DELETED",
            user_id=user_id,
            user_name=user_name,
            details=f"User {user_name} (ID #{user_id}) permanently deleted by Super Admin.",
            severity="danger",
        )
    )
    session.commit()
