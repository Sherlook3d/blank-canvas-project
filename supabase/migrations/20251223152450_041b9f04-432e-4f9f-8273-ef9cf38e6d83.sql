-- Insérer des réservations de test
INSERT INTO public.reservations (hotel_id, client_id, room_id, check_in, check_out, status, payment_status, total_price, notes)
VALUES
  -- Réservations aujourd'hui (arrivées)
  ('00000000-0000-0000-0000-000000000001', 'dee68e80-5ec5-4c51-94f3-98424c2b02fd', 'f3caed1a-5d6e-4213-a4de-fed635836050', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'confirmed', 'pending', 450000, 'Arrivée prévue à 14h'),
  ('00000000-0000-0000-0000-000000000001', '1eabb1b4-f48a-4c40-b86b-c021d4c8b0e7', 'e90cd27f-d689-4f58-9f8a-24fb1989d0df', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 'pending', 'pending', 500000, 'Client VIP - suite demandée'),
  
  -- Réservations en cours (checked_in)
  ('00000000-0000-0000-0000-000000000001', '6b6d7960-e124-49cb-bdc6-2921e47945a6', 'a64d87c4-993b-493f-8a1f-81ab4479ccc6', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 day', 'checked_in', 'paid', 750000, 'Séjour en cours'),
  ('00000000-0000-0000-0000-000000000001', '60945065-d829-4126-9d53-0a08096e2499', 'da7f1491-add0-455b-a584-6306ee6fc606', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days', 'checked_in', 'partial', 1200000, 'Suite royale'),
  
  -- Réservations futures
  ('00000000-0000-0000-0000-000000000001', 'e5226ac9-13a0-4965-909f-f5ba5819a662', '3e2f5dc8-8a53-4adc-b789-5cfbf05556be', CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '7 days', 'confirmed', 'pending', 1600000, 'Réservation anticipée'),
  ('00000000-0000-0000-0000-000000000001', 'dee68e80-5ec5-4c51-94f3-98424c2b02fd', 'f3caed1a-5d6e-4213-a4de-fed635836050', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '14 days', 'confirmed', 'paid', 600000, 'Client fidèle'),
  
  -- Réservations passées (checked_out)
  ('00000000-0000-0000-0000-000000000001', '1eabb1b4-f48a-4c40-b86b-c021d4c8b0e7', 'e90cd27f-d689-4f58-9f8a-24fb1989d0df', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '4 days', 'checked_out', 'paid', 750000, 'Séjour terminé'),
  ('00000000-0000-0000-0000-000000000001', '6b6d7960-e124-49cb-bdc6-2921e47945a6', 'a64d87c4-993b-493f-8a1f-81ab4479ccc6', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '10 days', 'checked_out', 'paid', 2400000, 'Long séjour');