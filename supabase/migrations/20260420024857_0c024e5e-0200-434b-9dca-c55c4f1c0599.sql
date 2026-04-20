-- Enums
CREATE TYPE public.transaction_kind AS ENUM ('charge','refund','deposit','fee','payout','expense');
CREATE TYPE public.transaction_status AS ENUM ('pending','succeeded','failed','refunded');
CREATE TYPE public.invoice_status AS ENUM ('draft','sent','paid','overdue','void');
CREATE TYPE public.payout_status AS ENUM ('scheduled','in_transit','paid','failed');

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  kind public.transaction_kind NOT NULL DEFAULT 'charge',
  status public.transaction_status NOT NULL DEFAULT 'succeeded',
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  counterparty text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners select transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER set_updated_at_transactions BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_transactions_owner_date ON public.transactions(owner_id, occurred_on DESC);
CREATE INDEX idx_transactions_event ON public.transactions(event_id);

-- Invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  number text NOT NULL,
  recipient_name text NOT NULL,
  recipient_email text,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  subtotal_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  issued_on date NOT NULL DEFAULT CURRENT_DATE,
  due_on date,
  paid_on date,
  notes text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners select invoices" ON public.invoices FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update invoices" ON public.invoices FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete invoices" ON public.invoices FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER set_updated_at_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_invoices_owner_due ON public.invoices(owner_id, due_on);

-- Receipts
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  vendor_name text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  category text,
  notes text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners select receipts" ON public.receipts FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert receipts" ON public.receipts FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update receipts" ON public.receipts FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete receipts" ON public.receipts FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER set_updated_at_receipts BEFORE UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_receipts_owner_date ON public.receipts(owner_id, occurred_on DESC);

-- Payouts
CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status public.payout_status NOT NULL DEFAULT 'scheduled',
  expected_on date,
  paid_on date,
  method text,
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners select payouts" ON public.payouts FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert payouts" ON public.payouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update payouts" ON public.payouts FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete payouts" ON public.payouts FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER set_updated_at_payouts BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_payouts_owner_date ON public.payouts(owner_id, expected_on DESC);