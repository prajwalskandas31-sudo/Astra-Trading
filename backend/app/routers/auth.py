from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session, select

from app.database import get_session
from app.models import SuperAdmin, AuditLog
from app.schemas import LoginRequest, TokenResponse, SuperAdminOut
from app.security import (
    create_access_token,
    decode_access_token,
    security_scheme,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

SessionDep = Annotated[Session, Depends(get_session)]
AuthCredsDep = Annotated[HTTPAuthorizationCredentials | None, Depends(security_scheme)]


def get_current_admin(
    credentials: AuthCredsDep,
    session: SessionDep,
) -> SuperAdmin:
    """Dependency to retrieve and validate the authenticated Super Admin."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )
    admin = session.get(SuperAdmin, int(admin_id))
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user account not found or access revoked.",
        )
    return admin


CurrentAdminDep = Annotated[SuperAdmin, Depends(get_current_admin)]


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: SessionDep) -> TokenResponse:
    """Super Admin Login: authenticate username/email & password, return JWT token."""
    query = select(SuperAdmin).where(
        (SuperAdmin.username == payload.username) | (SuperAdmin.email == payload.username)
    )
    admin = session.exec(query).first()
    if not admin or not verify_password(payload.password, admin.hashed_password):
        # Audit failed login attempt
        session.add(
            AuditLog(
                action="AUTH_LOGIN_FAILED",
                user_name=payload.username,
                details="Failed login attempt with invalid credentials.",
                severity="warning",
            )
        )
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # Success
    token = create_access_token({"sub": str(admin.id), "username": admin.username})

    session.add(
        AuditLog(
            action="AUTH_LOGIN_SUCCESS",
            user_name=admin.username,
            details="Super Admin successfully authenticated into Terminal.",
            severity="success",
        )
    )
    session.commit()

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=SuperAdminOut(
            id=admin.id,  # type: ignore
            username=admin.username,
            email=admin.email,
            full_name=admin.full_name,
        ),
    )


@router.get("/me", response_model=SuperAdminOut)
def get_me(current_admin: CurrentAdminDep) -> SuperAdminOut:
    """Return profile of currently logged-in Super Admin."""
    return SuperAdminOut(
        id=current_admin.id,  # type: ignore
        username=current_admin.username,
        email=current_admin.email,
        full_name=current_admin.full_name,
    )
