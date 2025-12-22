-- Create a hotel for the user
INSERT INTO public.hotels (id, name, address, phone, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Mon Hôtel', '123 Rue de Test', '+33 1 23 45 67 89', 'contact@monhotel.com');

-- Assign the hotel to the user's profile
UPDATE public.profiles 
SET hotel_id = '00000000-0000-0000-0000-000000000001'
WHERE id = '53918722-9c08-465f-b307-878b7f37c681';

-- Assign owner role to the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('53918722-9c08-465f-b307-878b7f37c681', 'owner');