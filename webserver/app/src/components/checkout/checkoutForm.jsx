import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Trans } from '@lingui/react/macro';
import { useProductStore } from '../../stores/productStore';

export default function CheckoutForm({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { fetchProducts } = useProductStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      if (fetchProducts) await fetchProducts();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: {
              applePay: 'never',
              googlePay: 'never',
            },
            paymentMethodOrder: ['card'],
          }}
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
      >
        {isProcessing ? (
          <Trans>Validation en cours...</Trans>
        ) : (
          <Trans>Confirmer le règlement</Trans>
        )}
      </button>
    </form>
  );
}