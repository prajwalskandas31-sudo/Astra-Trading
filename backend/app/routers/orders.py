from datetime import datetime, timezone
import random
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.database import get_session
from app.models import AuditLog, BrokerStatusEnum, User
from app.routers.auth import CurrentAdminDep
from app.schemas import OrderSimulateRequest, OrderSimulateResponse

router = APIRouter(prefix="/api/orders", tags=["orders"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("/simulate", response_model=OrderSimulateResponse)
def simulate_order_execution(
    payload: OrderSimulateRequest,
    current_admin: CurrentAdminDep,
    session: SessionDep,
) -> OrderSimulateResponse:
    """
    Test and demonstrate live order placement enforcement.
    Strictly verifies:
    1. User access active?
    2. Live orders enabled?
    3. Broker status connected?
    """
    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc)

    # Rule 1: Access Revoked check
    if not user.is_active:
        session.add(
            AuditLog(
                action="ORDER_BLOCKED_REVOKED_ACCESS",
                user_id=user.id,
                user_name=user.name,
                details=f"Order for {payload.symbol} {payload.side} {payload.quantity} BLOCKED: User account access is REVOKED.",
                severity="danger",
            )
        )
        session.commit()
        return OrderSimulateResponse(
            allowed=False,
            status="BLOCKED_REVOKED_ACCESS",
            reason=f"Account access for {user.name} is REVOKED. No orders can be placed.",
            user_id=user.id,  # type: ignore
            user_name=user.name,
            execution_time=now,
            details={"symbol": payload.symbol, "quantity": payload.quantity, "side": payload.side},
        )

    # Rule 2: Live Orders Toggle check
    if not user.live_orders_enabled:
        session.add(
            AuditLog(
                action="ORDER_BLOCKED_LIVE_ORDERS_OFF",
                user_id=user.id,
                user_name=user.name,
                details=f"Order for {payload.symbol} {payload.side} {payload.quantity} BLOCKED: Live order placement is DISABLED for this user.",
                severity="warning",
            )
        )
        session.commit()
        return OrderSimulateResponse(
            allowed=False,
            status="BLOCKED_LIVE_ORDERS_OFF",
            reason=f"Live order placement is switched OFF for {user.name}. Safety lock prevents execution.",
            user_id=user.id,  # type: ignore
            user_name=user.name,
            execution_time=now,
            details={"symbol": payload.symbol, "quantity": payload.quantity, "side": payload.side},
        )

    # Rule 3: Broker connection check
    if user.broker_status != BrokerStatusEnum.CONNECTED.value:
        session.add(
            AuditLog(
                action="ORDER_BLOCKED_BROKER_DISCONNECTED",
                user_id=user.id,
                user_name=user.name,
                details=f"Order for {payload.symbol} {payload.side} {payload.quantity} BLOCKED: Broker status is '{user.broker_status}'.",
                severity="danger",
            )
        )
        session.commit()
        return OrderSimulateResponse(
            allowed=False,
            status="BLOCKED_BROKER_STATUS",
            reason=f"Broker {user.broker_name} status is '{user.broker_status}'. Reauthorization required.",
            user_id=user.id,  # type: ignore
            user_name=user.name,
            execution_time=now,
            details={"symbol": payload.symbol, "quantity": payload.quantity, "side": payload.side},
        )

    # If all 3 safety rules pass, the live order is permitted!
    order_id = f"ORD-{random.randint(100000, 999999)}"
    exec_price = payload.price if payload.price else round(random.uniform(250.0, 4800.0), 2)

    session.add(
        AuditLog(
            action="ORDER_EXECUTED_LIVE",
            user_id=user.id,
            user_name=user.name,
            details=f"LIVE ORDER EXECUTED: {payload.side} {payload.quantity}x {payload.symbol} @ ₹{exec_price} through {user.broker_name} (Order ID: {order_id}).",
            severity="success",
        )
    )
    session.commit()

    return OrderSimulateResponse(
        allowed=True,
        status="EXECUTED",
        reason=f"Order successfully routed to {user.broker_name} for {user.name}.",
        user_id=user.id,  # type: ignore
        user_name=user.name,
        execution_time=now,
        details={
            "order_id": order_id,
            "symbol": payload.symbol,
            "side": payload.side,
            "quantity": payload.quantity,
            "price": exec_price,
            "broker": user.broker_name,
            "client_id": user.broker_client_id,
        },
    )
