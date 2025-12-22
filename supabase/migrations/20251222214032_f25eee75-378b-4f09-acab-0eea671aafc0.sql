-- Create hotels table
CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hotels
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'receptionist')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'double', 'suite', 'family')),
  capacity INTEGER NOT NULL DEFAULT 2,
  price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
  amenities TEXT[] DEFAULT '{}',
  floor INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hotel_id, number)
);

-- Enable RLS on rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  id_type TEXT,
  id_number TEXT,
  nationality TEXT,
  notes TEXT,
  vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Hotels: Users can view their hotel
CREATE POLICY "Users can view their hotel" ON public.hotels
  FOR SELECT USING (
    id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Profiles: Users can view profiles from same hotel
CREATE POLICY "Users can view hotel profiles" ON public.profiles
  FOR SELECT USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- User roles: Users can view their own role
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Rooms: Users can manage rooms in their hotel
CREATE POLICY "Users can view hotel rooms" ON public.rooms
  FOR SELECT USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert hotel rooms" ON public.rooms
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update hotel rooms" ON public.rooms
  FOR UPDATE USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete hotel rooms" ON public.rooms
  FOR DELETE USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- Clients: Users can manage clients in their hotel
CREATE POLICY "Users can view hotel clients" ON public.clients
  FOR SELECT USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert hotel clients" ON public.clients
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update hotel clients" ON public.clients
  FOR UPDATE USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete hotel clients" ON public.clients
  FOR DELETE USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

-- Reservations: Users can manage reservations in their hotel
CREATE POLICY "Users can view hotel reservations" ON public.reservations
  FOR SELECT USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert hotel reservations" ON public.reservations
  FOR INSERT WITH CHECK (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update hotel reservations" ON public.reservations
  FOR UPDATE USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete hotel reservations" ON public.reservations
  FOR DELETE USING (
    hotel_id IN (SELECT hotel_id FROM public.profiles WHERE id = auth.uid())
  );