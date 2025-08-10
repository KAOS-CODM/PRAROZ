-- Approved recipes table
CREATE TABLE recipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    image text,
    description text,
    instructions text,
    ingredients text[],  -- stored as an array
    prep_time text,
    cook_time text,
    servings text,
    calories text,
    protein text,
    carbs text,
    fat text,
    chef_tips text,
    created_at timestamp with time zone DEFAULT now()
);

-- Unapproved submissions table
CREATE TABLE submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    image text,
    description text,
    instructions text,
    ingredients text[],  -- stored as an array
    prep_time text,
    cook_time text,
    servings text,
    calories text,
    protein text,
    carbs text,
    fat text,
    chef_tips text,
    created_at timestamp with time zone DEFAULT now()
);

create extension if not exists pgcrypto;
