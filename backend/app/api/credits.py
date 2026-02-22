from fastapi import APIRouter, HTTPException, Request

from app.models.schemas import CreditBalance, CheckoutSessionResponse
from app.services.credits import get_credit_balance, add_credits, initialize_credits
from app.services.stripe_service import create_checkout_session, verify_webhook

router = APIRouter(prefix="/api/credits", tags=["credits"])

CREDITS_PER_PURCHASE = 50


@router.get("/balance", response_model=CreditBalance)
async def balance(request: Request):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(401, "Authentication required")

    credits = await get_credit_balance(user_id)
    return CreditBalance(credits=credits, user_id=user_id)


@router.post("/initialize", response_model=CreditBalance)
async def init_user_credits(request: Request):
    """Called after signup to give free credits."""
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(401, "Authentication required")

    credits = await initialize_credits(user_id)
    return CreditBalance(credits=credits, user_id=user_id)


@router.post("/checkout", response_model=CheckoutSessionResponse)
async def checkout(request: Request):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(401, "Authentication required")

    url = await create_checkout_session(user_id)
    return CheckoutSessionResponse(checkout_url=url)


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        event = verify_webhook(payload, sig)
    except Exception:
        raise HTTPException(400, "Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("user_id")
        if user_id:
            await add_credits(user_id, CREDITS_PER_PURCHASE)

    return {"received": True}
