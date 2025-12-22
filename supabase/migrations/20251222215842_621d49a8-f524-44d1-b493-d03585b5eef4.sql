-- Insérer des chambres de test pour l'hôtel
INSERT INTO public.rooms (hotel_id, number, type, capacity, price_per_night, floor, status, amenities, description)
VALUES
  ('00000000-0000-0000-0000-000000000001', '101', 'single', 1, 150000, 1, 'available', ARRAY['Wi-Fi', 'Climatisation'], 'Chambre simple avec vue sur jardin'),
  ('00000000-0000-0000-0000-000000000001', '102', 'single', 1, 150000, 1, 'available', ARRAY['Wi-Fi', 'Climatisation'], 'Chambre simple confortable'),
  ('00000000-0000-0000-0000-000000000001', '103', 'single', 1, 150000, 1, 'maintenance', ARRAY['Wi-Fi', 'Climatisation'], 'Chambre simple en rénovation'),
  ('00000000-0000-0000-0000-000000000001', '201', 'double', 2, 250000, 2, 'available', ARRAY['Wi-Fi', 'Climatisation', 'Minibar'], 'Chambre double spacieuse'),
  ('00000000-0000-0000-0000-000000000001', '202', 'double', 2, 250000, 2, 'occupied', ARRAY['Wi-Fi', 'Climatisation', 'Minibar'], 'Chambre double avec balcon'),
  ('00000000-0000-0000-0000-000000000001', '203', 'double', 2, 250000, 2, 'available', ARRAY['Wi-Fi', 'Climatisation', 'Minibar'], 'Chambre double vue ville'),
  ('00000000-0000-0000-0000-000000000001', '301', 'suite', 4, 600000, 3, 'available', ARRAY['Wi-Fi', 'Climatisation', 'Minibar', 'Baignoire', 'Salon'], 'Suite junior avec salon'),
  ('00000000-0000-0000-0000-000000000001', '302', 'suite', 4, 800000, 3, 'available', ARRAY['Wi-Fi', 'Climatisation', 'Minibar', 'Baignoire', 'Salon', 'Terrasse'], 'Suite royale avec terrasse'),
  ('00000000-0000-0000-0000-000000000001', '401', 'family', 5, 400000, 4, 'available', ARRAY['Wi-Fi', 'Climatisation', 'Minibar'], 'Chambre familiale grande'),
  ('00000000-0000-0000-0000-000000000001', '402', 'family', 5, 400000, 4, 'cleaning', ARRAY['Wi-Fi', 'Climatisation', 'Minibar'], 'Chambre familiale en nettoyage');