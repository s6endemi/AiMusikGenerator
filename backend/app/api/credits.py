from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.models.schemas import CreditBalance
from app.services.credits import get_credit_balance, initialize_credits

router = APIRouter(prefix="/api/credits", tags=["credits"])


@router.get("/balance", response_model=CreditBalance)
async def balance(user_id: str = Depends(get_current_user)):
    credits = await get_credit_balance(user_id)
    return CreditBalance(credits=credits, user_id=user_id)


@router.post("/initialize", response_model=CreditBalance)
async def init_user_credits(user_id: str = Depends(get_current_user)):
    """Called after login to give free credits to new users."""
    credits = await initialize_credits(user_id)
    return CreditBalance(credits=credits, user_id=user_id)
