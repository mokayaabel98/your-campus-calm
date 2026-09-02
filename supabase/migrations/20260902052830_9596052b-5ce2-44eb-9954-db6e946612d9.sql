ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS checkout_request_id text,
  ADD COLUMN IF NOT EXISTS merchant_request_id text,
  ADD COLUMN IF NOT EXISTS receipt_number text,
  ADD COLUMN IF NOT EXISTS result_desc text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE INDEX IF NOT EXISTS payments_checkout_request_id_idx ON public.payments (checkout_request_id);