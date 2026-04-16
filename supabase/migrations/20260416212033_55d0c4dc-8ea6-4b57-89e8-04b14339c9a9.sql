
CREATE TYPE public.recipe_difficulty AS ENUM ('facile', 'media', 'difficile');

CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE,
  source TEXT NOT NULL DEFAULT 'spoonacular',
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  image TEXT,
  ready_in_minutes INTEGER,
  servings INTEGER DEFAULT 2,
  difficulty public.recipe_difficulty NOT NULL DEFAULT 'facile',
  diets TEXT[] DEFAULT '{}',
  dish_types TEXT[] DEFAULT '{}',
  cuisines TEXT[] DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  nutrition JSONB,
  eco_score NUMERIC DEFAULT 8.5,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes are viewable by everyone"
  ON public.recipes FOR SELECT
  USING (true);

CREATE INDEX idx_recipes_slug ON public.recipes(slug);
CREATE INDEX idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX idx_recipes_ready_in_minutes ON public.recipes(ready_in_minutes);
CREATE INDEX idx_recipes_diets ON public.recipes USING GIN(diets);
CREATE INDEX idx_recipes_dish_types ON public.recipes USING GIN(dish_types);

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
