-- Fix RLS: ensure there is a PERMISSIVE INSERT policy on public.hotels

-- Safety: make sure RLS is enabled (no-op if already enabled)
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Remove any existing INSERT policy with this name
DROP POLICY IF EXISTS "Authenticated users can create hotel" ON public.hotels;

-- Create a PERMISSIVE insert policy for authenticated users
-- (If only RESTRICTIVE policies exist, inserts are denied because the permissive OR-set is empty)
CREATE POLICY "Authenticated users can create hotel"
ON public.hotels
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);
