-- Mettre à jour le statut des chambres qui ont une réservation checked_in
UPDATE public.rooms
SET status = 'occupied'
WHERE id IN (
  SELECT room_id FROM public.reservations WHERE status = 'checked_in'
);

-- Ajouter une réservation checked_in pour la chambre 202 (Double 202)
INSERT INTO public.reservations (hotel_id, client_id, room_id, check_in, check_out, status, payment_status, total_price, notes)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.clients WHERE hotel_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
  (SELECT id FROM public.rooms WHERE number = '202' AND hotel_id = '00000000-0000-0000-0000-000000000001'),
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '3 days',
  'checked_in',
  'paid',
  500000,
  'Séjour en cours'
WHERE EXISTS (SELECT 1 FROM public.rooms WHERE number = '202' AND hotel_id = '00000000-0000-0000-0000-000000000001');

-- Mettre à jour le statut de la chambre 202
UPDATE public.rooms
SET status = 'occupied'
WHERE number = '202' AND hotel_id = '00000000-0000-0000-0000-000000000001';