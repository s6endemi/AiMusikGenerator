from app.models.database import get_supabase
from app.config import get_settings

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


async def initialize_credits(user_id: str) -> int:
    settings = get_settings()
    try:
        db = get_supabase()
        db.table("credits").upsert(
            {"user_id": user_id, "balance": settings.free_credits_on_signup},
            on_conflict="user_id",
        ).execute()
    except Exception:
        _dev_credits[user_id] = settings.free_credits_on_signup
    return settings.free_credits_on_signup


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
