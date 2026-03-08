from fastapi import Request, HTTPException

from app.models.database import get_supabase


class AuthUser:
    """Authenticated user with id and metadata."""
    def __init__(self, id: str, email: str | None, full_name: str | None, avatar_url: str | None):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.avatar_url = avatar_url


async def get_current_user(request: Request) -> AuthUser:
    """Verify Supabase JWT and return authenticated user."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.removeprefix("Bearer ")

    try:
        db = get_supabase()
        user_response = db.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        u = user_response.user
        meta = u.user_metadata or {}
        return AuthUser(
            id=u.id,
            email=u.email,
            full_name=meta.get("full_name") or meta.get("name"),
            avatar_url=meta.get("avatar_url") or meta.get("picture"),
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
