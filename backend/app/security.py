from typing import Annotated
from datetime import datetime, timedelta, timezone
import base64
import hashlib
import json
import os
from cryptography.fernet import Fernet
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt

SECRET_KEY = os.getenv("SECRET_KEY", "srini-trading-super-admin-secret-key-2026-v1-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Derive 32-byte key for Fernet symmetric encryption of broker API secrets
_raw_key = hashlib.sha256(SECRET_KEY.encode()).digest()
FERNET_KEY = base64.urlsafe_b64encode(_raw_key)
cipher_suite = Fernet(FERNET_KEY)

security_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def encrypt_broker_credentials(creds: dict) -> str:
    """Encrypt broker credentials dictionary to a secure base64 string."""
    raw_json = json.dumps(creds).encode("utf-8")
    return cipher_suite.encrypt(raw_json).decode("utf-8")


def decrypt_broker_credentials(encrypted_str: str | None) -> dict:
    """Decrypt the stored encrypted credentials string back into a dictionary."""
    if not encrypted_str:
        return {}
    try:
        decrypted_bytes = cipher_suite.decrypt(encrypted_str.encode("utf-8"))
        return json.loads(decrypted_bytes.decode("utf-8"))
    except Exception:
        return {}


def mask_secret(value: str | None, visible_tail: int = 4) -> str:
    """Mask sensitive string like API keys or tokens."""
    if not value:
        return "Not Set"
    if len(value) <= visible_tail:
        return "****"
    return "*" * (len(value) - visible_tail) + value[-visible_tail:]
