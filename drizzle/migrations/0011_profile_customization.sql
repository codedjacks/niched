ALTER TABLE public.profiles
  ADD COLUMN favorite_sport text CHECK (favorite_sport IS NULL OR char_length(favorite_sport) <= 20),
  ADD COLUMN favorite_team text CHECK (favorite_team IS NULL OR char_length(favorite_team) <= 40),
  ADD COLUMN jersey_number text CHECK (jersey_number IS NULL OR jersey_number ~ '^[0-9]{1,2}$'),
  ADD COLUMN tagline text CHECK (tagline IS NULL OR char_length(tagline) <= 60),
  ADD COLUMN card_color text NOT NULL DEFAULT 'amber' CHECK (card_color IN ('amber','red','green','navy','silver'));