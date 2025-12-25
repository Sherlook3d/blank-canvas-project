
-- Créer les comptes clients pour les 5 clients malgaches
INSERT INTO comptes_clients (id, hotel_id, client_id, statut, total_facture, total_paye, solde, date_ouverture)
VALUES 
  ('cc111111-1111-1111-1111-111111111111', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '11111111-1111-1111-1111-111111111111', 'Soldé', 390000, 390000, 0, '2025-12-15'),
  ('cc222222-2222-2222-2222-222222222222', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '22222222-2222-2222-2222-222222222222', 'Soldé', 780000, 780000, 0, '2025-12-10'),
  ('cc333333-3333-3333-3333-333333333333', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '33333333-3333-3333-3333-333333333333', 'Soldé', 285000, 285000, 0, '2025-12-18'),
  ('cc444444-4444-4444-4444-444444444444', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '44444444-4444-4444-4444-444444444444', 'Ouvert', 800000, 230000, 570000, '2025-12-12'),
  ('cc555555-5555-5555-5555-555555555555', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '55555555-5555-5555-5555-555555555555', 'Soldé', 1200000, 1200000, 0, '2025-12-08');

-- Créer les réservations associées
INSERT INTO reservations (id, hotel_id, client_id, room_id, compte_id, check_in, check_out, status, payment_status, total_price)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '11111111-1111-1111-1111-111111111111', 'c3307a31-302f-4458-a589-1e229c482c67', 'cc111111-1111-1111-1111-111111111111', '2025-12-15', '2025-12-18', 'checked_out', 'paid', 195000),
  ('a2222222-2222-2222-2222-222222222222', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '22222222-2222-2222-2222-222222222222', '7df57062-0aab-4fab-8946-3eb7a96c8f4c', 'cc222222-2222-2222-2222-222222222222', '2025-12-10', '2025-12-15', 'checked_out', 'paid', 500000),
  ('a3333333-3333-3333-3333-333333333333', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '33333333-3333-3333-3333-333333333333', '7b6692f9-047d-4acc-8681-b7eea0371bb9', 'cc333333-3333-3333-3333-333333333333', '2025-12-18', '2025-12-21', 'checked_out', 'paid', 285000),
  ('a4444444-4444-4444-4444-444444444444', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '44444444-4444-4444-4444-444444444444', '52206f19-8b08-4c72-975e-819bf0741b46', 'cc444444-4444-4444-4444-444444444444', '2025-12-12', '2025-12-20', 'checked_out', 'partial', 500000),
  ('a5555555-5555-5555-5555-555555555555', 'a78726e5-a6fc-48e6-a458-ff358f865e61', '55555555-5555-5555-5555-555555555555', '258b013d-a1ad-46d5-899d-60d2a3b65adf', 'cc555555-5555-5555-5555-555555555555', '2025-12-08', '2025-12-14', 'checked_out', 'paid', 900000);

-- Ajouter les lignes de compte avec types valides
INSERT INTO lignes_compte (compte_id, type, description, montant, date_ligne)
VALUES 
  ('cc111111-1111-1111-1111-111111111111', 'Nuitée', 'Chambre 101 - 3 nuits', 195000, '2025-12-18'),
  ('cc111111-1111-1111-1111-111111111111', 'Restaurant', 'Petit-déjeuner x3', 45000, '2025-12-18'),
  ('cc111111-1111-1111-1111-111111111111', 'Blanchisserie', 'Blanchisserie', 25000, '2025-12-17'),
  ('cc111111-1111-1111-1111-111111111111', 'Minibar', 'Consommations minibar', 125000, '2025-12-17'),
  ('cc222222-2222-2222-2222-222222222222', 'Nuitée', 'Suite 301 - 5 nuits', 500000, '2025-12-15'),
  ('cc222222-2222-2222-2222-222222222222', 'Restaurant', 'Demi-pension x5', 75000, '2025-12-15'),
  ('cc222222-2222-2222-2222-222222222222', 'Spa', 'Massage relaxant', 85000, '2025-12-13'),
  ('cc222222-2222-2222-2222-222222222222', 'Autre', 'Transfert aéroport', 120000, '2025-12-10'),
  ('cc333333-3333-3333-3333-333333333333', 'Nuitée', 'Chambre 201 - 3 nuits', 285000, '2025-12-21'),
  ('cc444444-4444-4444-4444-444444444444', 'Nuitée', 'Suite 302 - 8 nuits', 500000, '2025-12-20'),
  ('cc444444-4444-4444-4444-444444444444', 'Restaurant', 'Pension complète x8', 160000, '2025-12-20'),
  ('cc444444-4444-4444-4444-444444444444', 'Minibar', 'Consommations minibar', 80000, '2025-12-19'),
  ('cc444444-4444-4444-4444-444444444444', 'Téléphone', 'Appels internationaux', 60000, '2025-12-18'),
  ('cc555555-5555-5555-5555-555555555555', 'Nuitée', 'Chambre familiale 202 - 6 nuits', 900000, '2025-12-14'),
  ('cc555555-5555-5555-5555-555555555555', 'Restaurant', 'Pension complète famille', 180000, '2025-12-14'),
  ('cc555555-5555-5555-5555-555555555555', 'Autre', 'Tour Antananarivo', 120000, '2025-12-11');

-- Ajouter les paiements avec méthodes valides (Espèces, Carte Bancaire, Mobile Money, Virement, Acompte)
INSERT INTO paiements_compte (compte_id, montant, methode, date_paiement, reference)
VALUES 
  ('cc111111-1111-1111-1111-111111111111', 390000, 'Espèces', '2025-12-18', 'CASH-1218-001'),
  ('cc222222-2222-2222-2222-222222222222', 780000, 'Carte Bancaire', '2025-12-15', 'CB-1215-001'),
  ('cc333333-3333-3333-3333-333333333333', 285000, 'Virement', '2025-12-21', 'VIR-1221-001'),
  ('cc444444-4444-4444-4444-444444444444', 150000, 'Espèces', '2025-12-12', 'CASH-1212-001'),
  ('cc444444-4444-4444-4444-444444444444', 80000, 'Mobile Money', '2025-12-15', 'MM-1215-001'),
  ('cc555555-5555-5555-5555-555555555555', 1200000, 'Virement', '2025-12-14', 'VIR-1214-001');

-- Mettre à jour les stats des clients
UPDATE clients SET nb_sejours = 1, total_depense = 390000, argent_du = 0 WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE clients SET nb_sejours = 1, total_depense = 780000, argent_du = 0 WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE clients SET nb_sejours = 1, total_depense = 285000, argent_du = 0 WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE clients SET nb_sejours = 0, total_depense = 0, argent_du = 570000 WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE clients SET nb_sejours = 1, total_depense = 1200000, argent_du = 0 WHERE id = '55555555-5555-5555-5555-555555555555';
