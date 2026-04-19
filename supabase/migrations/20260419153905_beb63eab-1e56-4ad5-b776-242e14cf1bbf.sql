-- Seller contact messages table
CREATE TABLE public.seller_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT seller_messages_sender_name_len CHECK (char_length(sender_name) BETWEEN 1 AND 120),
  CONSTRAINT seller_messages_sender_email_len CHECK (char_length(sender_email) BETWEEN 3 AND 255),
  CONSTRAINT seller_messages_sender_phone_len CHECK (sender_phone IS NULL OR char_length(sender_phone) <= 40),
  CONSTRAINT seller_messages_subject_len CHECK (char_length(subject) BETWEEN 1 AND 200),
  CONSTRAINT seller_messages_message_len CHECK (char_length(message) BETWEEN 1 AND 4000)
);

CREATE INDEX idx_seller_messages_seller_created
  ON public.seller_messages (seller_id, created_at DESC);

ALTER TABLE public.seller_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can send a message to an approved seller.
CREATE POLICY "Anyone can contact approved sellers"
  ON public.seller_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_messages.seller_id
        AND s.status = 'approved'
    )
  );

-- Seller (owner) can view their own messages.
CREATE POLICY "Sellers view own messages"
  ON public.seller_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_messages.seller_id
        AND s.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Seller (owner) can mark as read / set replied_at.
CREATE POLICY "Sellers update own messages"
  ON public.seller_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_messages.seller_id
        AND s.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sellers s
      WHERE s.id = seller_messages.seller_id
        AND s.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Auto-update updated_at
CREATE TRIGGER trg_seller_messages_updated_at
  BEFORE UPDATE ON public.seller_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();