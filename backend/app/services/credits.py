import logging

from app.models.database import get_supabase
from app.config import get_settings

logger = logging.getLogger(__name__)

# In-memory credits for dev/testing (before Auth is set up)
_dev_credits: dict[str, int] = {}


async def get_credit_balance(user_id: str) -> int:
    try:
        db = get_supabase()
        result = db.table("credits").select("balance").eq("user_id", user_id).maybe_single().execute()
        if result and result.data:
            return result.data["balance"]
    except Exception:
        pass

    # Fallback: in-memory credits for dev
    if user_id not in _dev_credits:
        _dev_credits[user_id] = get_settings().free_credits_on_signup
    return _dev_credits[user_id]


async def initialize_user(user_id: str, email: str | None = None,
                          full_name: str | None = None, avatar_url: str | None = None) -> int:
    """Create profile + credits for new users. Returns existing balance for returning users."""
    settings = get_settings()
    try:
        db = get_supabase()

        # Profile
        existing_profile = db.table("profiles").select("id").eq("id", user_id).maybe_single().execute()
        if not (existing_profile and existing_profile.data):
            display = full_name or (email.split("@")[0] if email else "User")
            db.table("profiles").insert({
                "id": user_id,
                "email": email,
                "display_name": display,
                "avatar_url": avatar_url or "",
            }).execute()

        # Credits
        existing_credits = db.table("credits").select("balance").eq("user_id", user_id).maybe_single().execute()
        if existing_credits and existing_credits.data:
            return existing_credits.data["balance"]
        db.table("credits").insert(
            {"user_id": user_id, "balance": settings.free_credits_on_signup}
        ).execute()
        return settings.free_credits_on_signup
    except Exception as e:
        logger.error(f"initialize_user failed for {user_id}: {e}")
        if user_id not in _dev_credits:
            _dev_credits[user_id] = settings.free_credits_on_signup
        return _dev_credits.get(user_id, settings.free_credits_on_signup)


async def deduct_credit(user_id: str) -> bool:
    balance = await get_credit_balance(user_id)
    if balance <= 0:
        return False

    try:
        db = get_supabase()
        db.table("credits").update({"balance": balance - 1}).eq("user_id", user_id).execute()
    except Exception:
        _dev_credits[user_id] = balance - 1
    return True


async def add_credits(user_id: str, amount: int) -> int:
    balance = await get_credit_balance(user_id)
    new_balance = balance + amount

    try:
        db = get_supabase()
        db.table("credits").upsert(
            {"user_id": user_id, "balance": new_balance},
            on_conflict="user_id",
        ).execute()
    except Exception:
        _dev_credits[user_id] = new_balance
    return new_balance
