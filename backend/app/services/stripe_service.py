import stripe
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)

# Tier name → (credits, env-var price ID field)
TIERS = {
    "starter": 5,
    "popular": 20,
    "pro": 100,
}


def init_stripe():
    settings = get_settings()
    stripe.api_key = settings.stripe_secret_key


def _get_price_id(tier: str) -> str:
    settings = get_settings()
    mapping = {
        "starter": settings.stripe_price_starter,
        "popular": settings.stripe_price_popular,
        "pro": settings.stripe_price_pro,
    }
    price_id = mapping.get(tier)
    if not price_id:
        raise ValueError(f"No Stripe price configured for tier '{tier}'")
    return price_id


async def create_checkout_session(user_id: str, tier: str) -> str:
    """Create a Stripe Checkout session for the given tier. Returns checkout URL."""
    if tier not in TIERS:
        raise ValueError(f"Unknown tier: {tier}")

    settings = get_settings()
    init_stripe()

    price_id = _get_price_id(tier)

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="payment",
        success_url=f"{settings.frontend_url}?purchase=success",
        cancel_url=f"{settings.frontend_url}?purchase=canceled",
        metadata={
            "user_id": user_id,
            "tier": tier,
            "credits": str(TIERS[tier]),
        },
    )
    return session.url


def verify_webhook(payload: bytes, sig_header: str) -> dict:
    """Verify and parse Stripe webhook event."""
    settings = get_settings()
    init_stripe()

    event = stripe.Webhook.construct_event(
        payload, sig_header, settings.stripe_webhook_secret
    )
    return event
