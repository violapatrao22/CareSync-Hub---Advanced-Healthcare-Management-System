/*
  # Add payment details to billing records

  1. Changes
    - Add payment-related columns to billing_records table:
      - payment_method_type: Type of payment method used (credit, debit, paypal)
      - payment_method_last4: Last 4 digits of card (if applicable)
      - payment_transaction_id: External payment transaction ID
      - payment_date: When the payment was processed
      - payment_status: Status of the payment (pending, completed, failed)

  2. Security
    - Maintain existing RLS policies
    - No new policies needed as we're only adding columns
*/

-- Add payment-related columns to billing_records
ALTER TABLE billing_records
ADD COLUMN IF NOT EXISTS payment_method_type text CHECK (payment_method_type IN ('credit', 'debit', 'paypal')),
ADD COLUMN IF NOT EXISTS payment_method_last4 text,
ADD COLUMN IF NOT EXISTS payment_transaction_id text,
ADD COLUMN IF NOT EXISTS payment_date timestamptz,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));

-- Create index for payment status for better query performance
CREATE INDEX IF NOT EXISTS idx_billing_records_payment_status ON billing_records(payment_status);