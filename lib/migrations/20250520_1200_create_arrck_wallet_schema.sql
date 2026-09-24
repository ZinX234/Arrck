-- Arrck Black Pay: Wallet, Cards & Verified Transactions Schema
-- Enables public and authenticated access with Row Level Security

CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  card_name TEXT NOT NULL DEFAULT 'Arrck Black',
  card_type TEXT NOT NULL DEFAULT 'Virtual Visa',
  last_four TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'SOLANA',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  theme TEXT NOT NULL DEFAULT 'BLACK_HOLO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on cards"
  ON public.cards FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on cards"
  ON public.cards FOR INSERT
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  signature TEXT NOT NULL UNIQUE,
  slot BIGINT NOT NULL,
  block_time BIGINT,
  err JSONB,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on transactions"
  ON public.wallet_transactions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_addr ON public.wallet_transactions (wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_cards_addr ON public.cards (user_address);