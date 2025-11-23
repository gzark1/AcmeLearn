"""
Authentication routes.

Provides fastapi-users standard routes:
- Registration (email/password)
- Login/logout (JWT)
- Password reset
- Email verification
"""
from fastapi import APIRouter

from core.users import fastapi_users, auth_backend
from schemas.user import UserRead, UserCreate


router = APIRouter()


# Include fastapi-users standard routers
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/jwt",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="",
    tags=["auth"],
)
