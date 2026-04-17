
CREATE TABLE public.product_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.seller_products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text NOT NULL,
  question text NOT NULL CHECK (char_length(question) BETWEEN 3 AND 1000),
  answer text CHECK (answer IS NULL OR char_length(answer) BETWEEN 1 AND 2000),
  answered_at timestamptz,
  answered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_questions_product ON public.product_questions(product_id, created_at DESC);
CREATE INDEX idx_product_questions_user ON public.product_questions(user_id);

ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view questions
CREATE POLICY "Questions viewable by everyone"
  ON public.product_questions FOR SELECT
  USING (true);

-- Authenticated users can post questions as themselves
CREATE POLICY "Authenticated users create own questions"
  ON public.product_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own questions
CREATE POLICY "Users delete own questions"
  ON public.product_questions FOR DELETE
  USING (auth.uid() = user_id);

-- Users can update their own question text (only if not yet answered)
CREATE POLICY "Users update own questions"
  ON public.product_questions FOR UPDATE
  USING (auth.uid() = user_id AND answer IS NULL)
  WITH CHECK (auth.uid() = user_id AND answer IS NULL);

-- Sellers can update (answer) questions on their own products
CREATE POLICY "Sellers answer questions on own products"
  ON public.product_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_products sp
      JOIN public.sellers s ON s.id = sp.seller_id
      WHERE sp.id = product_questions.product_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.seller_products sp
      JOIN public.sellers s ON s.id = sp.seller_id
      WHERE sp.id = product_questions.product_id AND s.user_id = auth.uid()
    )
  );

-- Auto-update updated_at + answered_at on answer
CREATE OR REPLACE FUNCTION public.touch_question_answer()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.answer IS DISTINCT FROM OLD.answer AND NEW.answer IS NOT NULL THEN
    NEW.answered_at := now();
    NEW.answered_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_product_questions_touch
  BEFORE UPDATE ON public.product_questions
  FOR EACH ROW EXECUTE FUNCTION public.touch_question_answer();
