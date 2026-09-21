#!/bin/sh
set -e

echo "[stripe_listener] Starting Stripe webhook listener..."

exec stripe listen \
    --api-key "$PRIVATE_STRIPE_KEY" \
    --forward-to "http://back:3000/newPayment/confirm"