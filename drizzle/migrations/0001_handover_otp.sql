ALTER TABLE public.items ADD COLUMN status text NOT NULL DEFAULT 'open'
  CHECK (status IN ('open','handover_requested','awaiting_verification','returned'));

CREATE TABLE public.item_secrets (
  item_id uuid PRIMARY KEY REFERENCES public.items(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.item_secrets TO service_role;
ALTER TABLE public.item_secrets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.handovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  found_item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  match_score int NOT NULL,
  status text NOT NULL DEFAULT 'awaiting_verification'
    CHECK (status IN ('handover_requested','awaiting_verification','verified','returned','cancelled')),
  otp_hash text,
  otp_cipher text,
  otp_expires_at timestamptz,
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lost_item_id, found_item_id)
);
GRANT ALL ON public.handovers TO service_role;
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;