-- Insérer des clients de test pour l'hôtel
INSERT INTO public.clients (hotel_id, first_name, last_name, email, phone, nationality, vip, notes)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Jean', 'Dupont', 'jean.dupont@email.com', '+225 07 00 00 01', 'Ivoirienne', false, 'Client régulier'),
  ('00000000-0000-0000-0000-000000000001', 'Marie', 'Koné', 'marie.kone@email.com', '+225 07 00 00 02', 'Ivoirienne', true, 'Cliente VIP - préfère les suites'),
  ('00000000-0000-0000-0000-000000000001', 'Pierre', 'Martin', 'pierre.martin@email.fr', '+33 6 00 00 00 03', 'Française', false, 'Voyage d''affaires'),
  ('00000000-0000-0000-0000-000000000001', 'Aminata', 'Touré', 'aminata.toure@email.com', '+225 07 00 00 04', 'Ivoirienne', true, 'Cliente fidèle depuis 2020'),
  ('00000000-0000-0000-0000-000000000001', 'Ahmed', 'Diallo', 'ahmed.diallo@email.com', '+225 07 00 00 05', 'Malienne', false, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Sophie', 'Bamba', 'sophie.bamba@email.com', '+225 07 00 00 06', 'Ivoirienne', false, 'Allergies alimentaires'),
  ('00000000-0000-0000-0000-000000000001', 'Olivier', 'Yao', 'olivier.yao@email.com', '+225 07 00 00 07', 'Ivoirienne', true, 'Préfère étage élevé'),
  ('00000000-0000-0000-0000-000000000001', 'Fatou', 'Coulibaly', 'fatou.coulibaly@email.com', '+225 07 00 00 08', 'Ivoirienne', false, NULL);