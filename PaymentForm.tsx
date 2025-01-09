import React, { useState } from 'react';
import { PaymentProcessor } from '../lib/payment';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { updateBillingPayment } from '../lib/api';

interface Props {
  amount: number;
  billingId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ amount, billingId, onSuccess, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  const handlePayPalPayment = async (data: any, actions: any) => {
    try {
      const order = await actions.order.capture();
      await updateBillingPayment(billingId, {
        paymentMethodType: 'paypal',
        paymentTransactionId: order.id,
        paymentStatus: 'completed'
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      await updateBillingPayment(billingId, {
        paymentMethodType: 'paypal',
        paymentTransactionId: 'failed',
        paymentStatus: 'failed'
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
        <p className="text-gray-600">Amount due: ${amount.toFixed(2)}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-2 px-4 rounded-md ${
              paymentMethod === 'card'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Credit Card
          </button>
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`flex-1 py-2 px-4 rounded-md ${
              paymentMethod === 'paypal'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            PayPal
          </button>
        </div>
      </div>

      {paymentMethod === 'paypal' ? (
        <div className="mt-4">
          <PayPalButtons
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount.toString(),
                      currency_code: "USD"
                    },
                  },
                ],
              });
            }}
            onApprove={handlePayPalPayment}
            onError={(err) => {
              console.error('PayPal Error:', err);
              setError('Payment failed. Please try again.');
            }}
            onCancel={() => {
              setError('Payment was cancelled');
              onCancel();
            }}
            style={{ layout: "horizontal" }}
          />
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-center text-gray-600">
            Credit card payments are temporarily unavailable. Please use PayPal.
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}