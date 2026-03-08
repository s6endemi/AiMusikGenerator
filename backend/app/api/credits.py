from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user, AuthUser
from app.models.schemas import CreditBalance
from app.services.credits import get_credit_balance, initialize_user

router = APIRouter(prefix="/api/credits", tags=["credits"])


@router.get("/balance", response_model=CreditBalance)
async def balance(user: AuthUser = Depends(get_current_user)):
    credits = await get_credit_balance(user.id)
    return CreditBalance(credits=credits, user_id=user.id)


@router.post("/initialize", response_model=CreditBalance)
async def init_user_credits(user: AuthUser = Depends(get_current_user)):
    """Called after login to create profile + give free credits to new users."""
    credits = await initialize_user(user.id, user.email, user.full_name, user.avatar_url)
    return CreditBalance(credits=credits, user_id=user.id)
