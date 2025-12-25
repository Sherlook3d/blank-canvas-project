-- Add theme column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light-gray' 
CHECK (theme IN ('dark-gray', 'light-gray', 'blue', 'green'));