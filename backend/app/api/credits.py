import logging

from fastapi import APIRouter, Depends, Request, HTTPException

from app.middleware.auth import get_current_user, AuthUser
from app.models.schemas import CreditBalance, CheckoutSessionResponse
from app.services.credits import get_credit_balance, initialize_user, add_credits
from app.services.stripe_service import create_checkout_session, verify_webhook, TIERS

logger = logging.getLogger(__name__)

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


@router.post("/checkout", response_model=CheckoutSessionResponse)
async def checkout(tier: str, user: AuthUser = Depends(get_current_user)):
    """Create a Stripe Checkout session for the given pricing tier."""
    if tier not in TIERS:
        raise HTTPException(status_code=400, detail=f"Invalid tier: {tier}. Use starter, popular, or pro.")
    try:
        url = await create_checkout_session(user.id, tier)
        return CheckoutSessionResponse(checkout_url=url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Checkout failed for {user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Stripe webhook receiver — credits user after successful payment."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = verify_webhook(payload, sig_header)
    except Exception as e:
        logger.warning(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id")
        credits_str = metadata.get("credits")
        tier = metadata.get("tier", "unknown")

        if not user_id or not credits_str:
            logger.error(f"Webhook missing metadata: {metadata}")
            return {"status": "error", "detail": "Missing metadata"}

        credits_amount = int(credits_str)
        new_balance = await add_credits(user_id, credits_amount)
        logger.info(f"Added {credits_amount} credits ({tier}) to user {user_id}. New balance: {new_balance}")

    return {"status": "ok"}
