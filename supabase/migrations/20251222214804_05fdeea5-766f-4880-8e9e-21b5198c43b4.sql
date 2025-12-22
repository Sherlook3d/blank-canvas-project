-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view hotel profiles" ON public.profiles;

-- Create a security definer function to get user's hotel_id safely
CREATE OR REPLACE FUNCTION public.get_user_hotel_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hotel_id FROM public.profiles WHERE id = _user_id
$$;

-- Recreate the policy without recursion
CREATE POLICY "Users can view hotel profiles" ON public.profiles
  FOR SELECT USING (
    hotel_id IS NULL OR hotel_id = public.get_user_hotel_id(auth.uid())
  );

-- Fix hotels policy to use the function
DROP POLICY IF EXISTS "Users can view their hotel" ON public.hotels;
CREATE POLICY "Users can view their hotel" ON public.hotels
  FOR SELECT USING (
    id = public.get_user_hotel_id(auth.uid())
  );

-- Fix rooms policies
DROP POLICY IF EXISTS "Users can view hotel rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can insert hotel rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can update hotel rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can delete hotel rooms" ON public.rooms;

CREATE POLICY "Users can view hotel rooms" ON public.rooms
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert hotel rooms" ON public.rooms
  FOR INSERT WITH CHECK (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update hotel rooms" ON public.rooms
  FOR UPDATE USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can delete hotel rooms" ON public.rooms
  FOR DELETE USING (hotel_id = public.get_user_hotel_id(auth.uid()));

-- Fix clients policies
DROP POLICY IF EXISTS "Users can view hotel clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert hotel clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update hotel clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete hotel clients" ON public.clients;

CREATE POLICY "Users can view hotel clients" ON public.clients
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert hotel clients" ON public.clients
  FOR INSERT WITH CHECK (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update hotel clients" ON public.clients
  FOR UPDATE USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can delete hotel clients" ON public.clients
  FOR DELETE USING (hotel_id = public.get_user_hotel_id(auth.uid()));

-- Fix reservations policies
DROP POLICY IF EXISTS "Users can view hotel reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can insert hotel reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update hotel reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete hotel reservations" ON public.reservations;

CREATE POLICY "Users can view hotel reservations" ON public.reservations
  FOR SELECT USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert hotel reservations" ON public.reservations
  FOR INSERT WITH CHECK (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update hotel reservations" ON public.reservations
  FOR UPDATE USING (hotel_id = public.get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can delete hotel reservations" ON public.reservations
  FOR DELETE USING (hotel_id = public.get_user_hotel_id(auth.uid()));