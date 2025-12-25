-- Allow authenticated users to create a hotel (for initial setup)
CREATE POLICY "Authenticated users can create hotel"
ON public.hotels
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow hotel owners to update their hotel
CREATE POLICY "Owners can update their hotel"
ON public.hotels
FOR UPDATE
USING (id = get_user_hotel_id(auth.uid()) AND has_role(auth.uid(), 'owner'));

-- Allow users to set their own hotel_id in profile (only if currently null)
CREATE POLICY "Users can set own hotel_id"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow users to create their own initial role (only if they don't have one yet)
CREATE POLICY "Users can create own initial role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )
);