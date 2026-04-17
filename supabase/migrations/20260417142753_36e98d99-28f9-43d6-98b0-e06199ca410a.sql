-- Meal Plans
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  plan_data JSONB NOT NULL DEFAULT '{"days": []}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX idx_meal_plans_user ON public.meal_plans(user_id, week_start DESC);
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own meal plans" ON public.meal_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own meal plans" ON public.meal_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own meal plans" ON public.meal_plans
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Community Posts
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  recipe_external_id TEXT,
  recipe_title TEXT,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_posts_recent ON public.community_posts(created_at DESC);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts viewable by everyone" ON public.community_posts
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Likes
CREATE TABLE public.community_post_likes (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes viewable by everyone" ON public.community_post_likes
  FOR SELECT USING (true);
CREATE POLICY "Users like as themselves" ON public.community_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike own" ON public.community_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE TABLE public.community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_comments_post ON public.community_post_comments(post_id, created_at);
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by everyone" ON public.community_post_comments
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can comment" ON public.community_post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.community_post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Counter triggers
CREATE OR REPLACE FUNCTION public.recompute_post_counters()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE public.community_posts
  SET
    likes_count = (SELECT COUNT(*) FROM public.community_post_likes WHERE post_id = target_id),
    comments_count = (SELECT COUNT(*) FROM public.community_post_comments WHERE post_id = target_id)
  WHERE id = target_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_likes_counter
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.recompute_post_counters();

CREATE TRIGGER trg_comments_counter
  AFTER INSERT OR DELETE ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION public.recompute_post_counters();

-- Storage bucket for community photos
INSERT INTO storage.buckets (id, name, public) VALUES ('community', 'community', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Community images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'community');
CREATE POLICY "Authenticated upload community images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'community' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own community images" ON storage.objects
  FOR DELETE USING (bucket_id = 'community' AND auth.uid()::text = (storage.foldername(name))[1]);