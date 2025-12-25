-- Ajout de dépenses pour tester le module Finances (sans conflit existant)
INSERT INTO depenses (hotel_id, date, categorie_id, description, montant, fournisseur, moyen_paiement, validee)
VALUES
  ('a78726e5-a6fc-48e6-a458-ff358f865e61', '2025-12-20', 'fff7c581-07a7-4190-b99b-20996101d5db', 'Achat produits alimentaires marché Analakely', 450000, 'Marché Analakely', 'Espèces', true),
  ('a78726e5-a6fc-48e6-a458-ff358f865e61', '2025-12-21', '039b6ed2-7df8-4247-9b4a-8f2a450ee6ae', 'Réparation climatisation chambre 101', 280000, 'Froid Service Madagascar', 'Virement', true),
  ('a78726e5-a6fc-48e6-a458-ff358f865e61', '2025-12-22', 'd163691c-28ee-4e9b-a6a6-870738cc185d', 'Achat draps et serviettes', 520000, 'Textile Madagascar', 'Chèque', true),
  ('a78726e5-a6fc-48e6-a458-ff358f865e61', '2025-12-23', '43d10f39-9d16-419f-a1f8-68312365c15a', 'Salaires personnel semaine 51', 2500000, 'Paie interne', 'Virement', true),
  ('a78726e5-a6fc-48e6-a458-ff358f865e61', '2025-12-24', '62941664-d145-4054-933e-6fb57341ed33', 'Publicité Facebook et Google', 180000, 'Agence DigiMad', 'Carte Bancaire', false),
  ('a78726e5-a6fc-48e6-a458-ff358f865e61', '2025-12-25', 'fff7c581-07a7-4190-b99b-20996101d5db', 'Menu spécial Noël - ingrédients', 680000, 'Metro Cash & Carry', 'Espèces', true);

-- Mise à jour des stats clients
UPDATE clients SET 
  argent_du = 370000,
  nb_sejours = 1
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Ajout d'une note importante pour le client en dette
INSERT INTO notes_clients (hotel_id, client_id, titre, contenu, type, alerte_checkin)
SELECT 'a78726e5-a6fc-48e6-a458-ff358f865e61', '44444444-4444-4444-4444-444444444444', 'DETTE IMPAYÉE', 'Ce client a quitté hôtel le 20/12/2025 avec dette de 370 000 Ar.', 'Important', true
WHERE EXISTS (SELECT 1 FROM clients WHERE id = '44444444-4444-4444-4444-444444444444');