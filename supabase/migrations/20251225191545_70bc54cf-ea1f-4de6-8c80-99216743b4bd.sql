-- Drop the existing check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;

-- Add new check constraint with apple-gray theme
ALTER TABLE public.profiles ADD CONSTRAINT profiles_theme_check 
CHECK (theme IS NULL OR theme IN ('midnight-dark', 'soft-light', 'ocean-blue', 'nature-green', 'apple-gray', 'dark-gray', 'light-gray', 'blue', 'green'));