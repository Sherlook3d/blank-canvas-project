-- Insertion de 5 clients malgaches
INSERT INTO clients (id, hotel_id, first_name, last_name, phone, email, nationality, id_type, id_number, vip, argent_du)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'a78726e5-a6fc-48e6-a458-ff358f865e61', 'Hery', 'Rakotomalala', '+261 34 12 345 67', 'hery.rakoto@gmail.com', 'Malgache', 'CIN', '101 234 567 890', false, 550000),
  ('22222222-2222-2222-2222-222222222222', 'a78726e5-a6fc-48e6-a458-ff358f865e61', 'Fanja', 'Rasoamanana', '+261 33 98 765 43', 'fanja.rasoa@yahoo.fr', 'Malgache', 'CIN', '201 876 543 210', true, 550000),
  ('33333333-3333-3333-3333-333333333333', 'a78726e5-a6fc-48e6-a458-ff358f865e61', 'Nivo', 'Andriamampianina', '+261 32 11 222 33', 'nivo.andria@outlook.com', 'Malgache', 'Passeport', 'MG12345678', false, 0),
  ('44444444-4444-4444-4444-444444444444', 'a78726e5-a6fc-48e6-a458-ff358f865e61', 'Tiana', 'Razafindrakoto', '+261 34 55 666 77', 'tiana.raza@gmail.com', 'Malgache', 'CIN', '301 555 666 777', false, 370000),
  ('55555555-5555-5555-5555-555555555555', 'a78726e5-a6fc-48e6-a458-ff358f865e61', 'Mamy', 'Rabemananjara', '+261 33 88 999 00', 'mamy.rabe@hotmail.com', 'Malgache', 'CIN', '401 888 999 000', true, 650000);

-- Note pour client en dette
INSERT INTO notes_clients (hotel_id, client_id, titre, contenu, type, alerte_checkin)
VALUES ('a78726e5-a6fc-48e6-a458-ff358f865e61', '44444444-4444-4444-4444-444444444444', 'DETTE IMPAYÉE', 'Ce client a quitté hôtel le 20/12/2025 avec dette de 370 000 Ar.', 'Important', true);