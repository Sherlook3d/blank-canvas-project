-- Create a security definer function to check user roles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Owners can view hotel user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can delete user roles" ON public.user_roles;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Owners can view all hotel user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can update user roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can delete user roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'owner'));

-- Also fix role_permissions policies that reference user_roles
DROP POLICY IF EXISTS "Owners can insert permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Owners can update permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Owners can delete permissions" ON public.role_permissions;

CREATE POLICY "Owners can insert permissions"
ON public.role_permissions
FOR INSERT
WITH CHECK (
  hotel_id = get_user_hotel_id(auth.uid()) 
  AND public.has_role(auth.uid(), 'owner')
);

CREATE POLICY "Owners can update permissions"
ON public.role_permissions
FOR UPDATE
USING (
  hotel_id = get_user_hotel_id(auth.uid()) 
  AND public.has_role(auth.uid(), 'owner')
);

CREATE POLICY "Owners can delete permissions"
ON public.role_permissions
FOR DELETE
USING (
  hotel_id = get_user_hotel_id(auth.uid()) 
  AND public.has_role(auth.uid(), 'owner')
);