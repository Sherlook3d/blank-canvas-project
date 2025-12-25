-- Drop the existing check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;

-- Add new check constraint with updated theme names
ALTER TABLE public.profiles ADD CONSTRAINT profiles_theme_check 
CHECK (theme IS NULL OR theme IN ('midnight-dark', 'soft-light', 'ocean-blue', 'nature-green', 'dark-gray', 'light-gray', 'blue', 'green'));