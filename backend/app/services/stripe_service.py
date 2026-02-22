import stripe

from app.config import get_settings


def init_stripe():
    settings = get_settings()
    stripe.api_key = settings.stripe_secret_key


async def create_checkout_session(user_id: str) -> str:
    """Create a Stripe Checkout session for 50 credits. Returns checkout URL."""
    settings = get_settings()
    init_stripe()

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": settings.stripe_price_id, "quantity": 1}],
        mode="payment",
        success_url=f"{settings.frontend_url}/credits?success=true",
        cancel_url=f"{settings.frontend_url}/credits?canceled=true",
        metadata={"user_id": user_id},
    )
    return session.url


def verify_webhook(payload: bytes, sig_header: str) -> dict:
    """Verify and parse Stripe webhook event."""
    settings = get_settings()
    init_stripe()

    event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    return event
