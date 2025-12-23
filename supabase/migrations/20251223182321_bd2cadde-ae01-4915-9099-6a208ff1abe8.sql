-- Insert Malagasy clients - some from COLAS, others individuals
INSERT INTO public.clients (hotel_id, first_name, last_name, phone, company, nationality, vip)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Tahina', 'Rakotoarisoa', '+261 34 12 345 67', 'COLAS Madagascar', 'Malagasy', false),
  ('00000000-0000-0000-0000-000000000001', 'Faly', 'Randrianarison', '+261 33 98 765 43', 'COLAS Madagascar', 'Malagasy', true),
  ('00000000-0000-0000-0000-000000000001', 'Voahirana', 'Rasoamanana', '+261 32 11 222 33', 'COLAS Madagascar', 'Malagasy', false),
  ('00000000-0000-0000-0000-000000000001', 'Andry', 'Razafindrakoto', '+261 34 55 666 77', NULL, 'Malagasy', false),
  ('00000000-0000-0000-0000-000000000001', 'Nomena', 'Ratsimba', '+261 33 44 555 66', NULL, 'Malagasy', false),
  ('00000000-0000-0000-0000-000000000001', 'Harisoa', 'Andrianjafy', '+261 32 88 999 00', NULL, 'Malagasy', true);