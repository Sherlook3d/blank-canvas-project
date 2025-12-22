-- =============================================
-- HotelManager Database Schema
-- À copier-coller dans Supabase Studio > SQL Editor
-- Puis cliquer sur "Run"
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE public.app_role AS ENUM ('owner', 'manager', 'receptionist');
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'maintenance', 'out_of_service');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'mobile_money', 'bank_transfer');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'refunded', 'failed');

-- =============================================
-- PROFILES TABLE (linked to auth.users)
-- =============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id UUID,
  name TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- USER ROLES TABLE (separate for security)
-- =============================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'));

-- =============================================
-- HOTELS TABLE
-- =============================================

CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_stars INTEGER NOT NULL DEFAULT 3 CHECK (category_stars >= 1 AND category_stars <= 5),
  description TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'Indian/Antananarivo',
  currency TEXT NOT NULL DEFAULT 'MGA',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotel users can view their hotel"
  ON public.hotels FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Owners can update their hotel"
  ON public.hotels FOR UPDATE
  TO authenticated
  USING (
    id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
    AND public.has_role(auth.uid(), 'owner')
  );

-- =============================================
-- ROOM TYPES TABLE
-- =============================================

CREATE TABLE public.room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity_adults INTEGER NOT NULL DEFAULT 2,
  capacity_children INTEGER NOT NULL DEFAULT 0,
  base_price DECIMAL(12, 2) NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotel users can view room types"
  ON public.room_types FOR SELECT
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers and owners can manage room types"
  ON public.room_types FOR ALL
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
    AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'manager'))
  );

-- =============================================
-- ROOMS TABLE
-- =============================================

CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE RESTRICT,
  number TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 1,
  status room_status NOT NULL DEFAULT 'available',
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (hotel_id, number)
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotel users can view rooms"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Staff can manage rooms"
  ON public.rooms FOR ALL
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- =============================================
-- GUESTS TABLE
-- =============================================

CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  preferences TEXT,
  is_vip BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  total_stays INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  last_visit DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotel users can view guests"
  ON public.guests FOR SELECT
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Staff can manage guests"
  ON public.guests FOR ALL
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- =============================================
-- RESERVATIONS TABLE
-- =============================================

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
  status reservation_status NOT NULL DEFAULT 'pending',
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE RESTRICT,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MGA',
  source TEXT NOT NULL DEFAULT 'Direct',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (hotel_id, code),
  CHECK (check_out > check_in)
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotel users can view reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Staff can manage reservations"
  ON public.reservations FOR ALL
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- =============================================
-- PAYMENTS TABLE
-- =============================================

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'cash',
  status payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotel users can view payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Staff can manage payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- =============================================
-- ACTIVITY LOGS TABLE
-- =============================================

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotel users can view logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "System can insert logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES for performance
-- =============================================

CREATE INDEX idx_profiles_hotel_id ON public.profiles(hotel_id);
CREATE INDEX idx_rooms_hotel_id ON public.rooms(hotel_id);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_guests_hotel_id ON public.guests(hotel_id);
CREATE INDEX idx_reservations_hotel_id ON public.reservations(hotel_id);
CREATE INDEX idx_reservations_dates ON public.reservations(check_in, check_out);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_payments_reservation ON public.payments(reservation_id);
