-- Database schema for recipes and submissions
-- WARNING: This schema is for context only and is not meant to be run as-is

CREATE TABLE public.recipes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    image text,
    description text,
    instructions text,
    instructions_array text[],
    ingredients jsonb,
    prep_time text,
    cook_time text,
    servings text,
    calories text,
    protein text,
    carbs text,
    fat text,
    chef_tips text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recipes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    image text,
    description text,
    instructions text,
    instructions_array text[],
    ingredients jsonb,
    prep_time text,
    cook_time text,
    servings text,
    calories text,
    protein text,
    carbs text,
    fat text,
    chef_tips text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT submissions_pkey PRIMARY KEY (id)
);
