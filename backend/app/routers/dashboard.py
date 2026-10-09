from typing import Annotated
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func

from app.database import get_session
from app.models import AuditLog, BrokerStatusEnum, User
from app.routers.auth import CurrentAdminDep
from app.schemas import AuditLogOut, DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> DashboardStats:
    """Retrieve summarized statistics across all users, brokers, and toggles."""
    users = session.exec(select(User)).all()

    total_users = len(users)
    active_users = sum(1 for u in users if u.is_active)
    revoked_users = total_users - active_users
    live_orders_active = sum(1 for u in users if u.live_orders_enabled)
    broker_connected = sum(1 for u in users if u.broker_status == BrokerStatusEnum.CONNECTED.value)
    broker_reauth = sum(1 for u in users if u.broker_status == BrokerStatusEnum.REQUIRES_REAUTHORIZATION.value)
    broker_disconnected = sum(1 for u in users if u.broker_status == BrokerStatusEnum.DISCONNECTED.value)
    whatsapp_alerts_active = sum(1 for u in users if u.whatsapp_alerts_enabled)
    telegram_alerts_active = sum(1 for u in users if u.telegram_alerts_enabled)

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        revoked_users=revoked_users,
        live_orders_active=live_orders_active,
        broker_connected=broker_connected,
        broker_reauth=broker_reauth,
        broker_disconnected=broker_disconnected,
        whatsapp_alerts_active=whatsapp_alerts_active,
        telegram_alerts_active=telegram_alerts_active,
    )


@router.get("/audit-logs", response_model=list[AuditLogOut])
def get_audit_logs(
    current_admin: CurrentAdminDep,
    session: SessionDep,
    limit: int = Query(50, ge=1, le=200),
) -> list[AuditLogOut]:
    """Retrieve audit events logged across the terminal."""
    logs = session.exec(
        select(AuditLog).order_by(AuditLog.id.desc()).limit(limit)  # type: ignore
    ).all()
    return [
        AuditLogOut(
            id=log.id,  # type: ignore
            timestamp=log.timestamp,
            action=log.action,
            user_id=log.user_id,
            user_name=log.user_name,
            details=log.details,
            severity=log.severity,
        )
        for log in logs
    ]
