-- Allow new room type 'bungalow' in rooms.type
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_type_check;

ALTER TABLE public.rooms
ADD CONSTRAINT rooms_type_check
CHECK (type = ANY (ARRAY['single','double','suite','family','bungalow']));