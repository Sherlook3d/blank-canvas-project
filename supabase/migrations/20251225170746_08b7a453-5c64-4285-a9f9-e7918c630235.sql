-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can create hotel" ON public.hotels;

-- Recreate as explicitly PERMISSIVE (default behavior)
CREATE POLICY "Authenticated users can create hotel"
ON public.hotels
FOR INSERT
TO authenticated
WITH CHECK (true);