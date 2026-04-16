-- Plan tier enum
CREATE TYPE public.plan_tier AS ENUM ('free', 'pro', 'business');

-- user_plans
CREATE TABLE public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tier public.plan_tier NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  ai_messages_today INTEGER NOT NULL DEFAULT 0,
  ai_messages_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan" ON public.user_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plan" ON public.user_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plan" ON public.user_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- saved_recipes
CREATE TABLE public.saved_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  external_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'spoonacular',
  title TEXT NOT NULL,
  image_url TEXT,
  ready_in_minutes INTEGER,
  diets TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, source, external_id)
);

ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved recipes" ON public.saved_recipes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved recipes" ON public.saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved recipes" ON public.saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- co2_log
CREATE TABLE public.co2_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  kg_co2 NUMERIC(8,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.co2_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own co2 log" ON public.co2_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own co2 log" ON public.co2_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_co2_log_user ON public.co2_log(user_id, created_at DESC);
CREATE INDEX idx_saved_recipes_user ON public.saved_recipes(user_id, created_at DESC);

-- Trigger: auto-create free plan on signup (extends existing handle_new_user via separate trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, tier)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_plan();

-- Backfill existing users
INSERT INTO public.user_plans (user_id, tier)
SELECT id, 'free' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;