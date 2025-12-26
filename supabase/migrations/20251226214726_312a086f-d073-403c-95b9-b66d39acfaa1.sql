-- Extend existing hotels table with SaaS multi-tenant fields
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS couleur_primaire text,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS prix_mensuel numeric(10,2) NOT NULL DEFAULT 50.00,
  ADD COLUMN IF NOT EXISTS statut text NOT NULL DEFAULT 'actif',
  ADD COLUMN IF NOT EXISTS date_abonnement timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS date_fin_abonnement timestamptz,
  ADD COLUMN IF NOT EXISTS jours_trial integer NOT NULL DEFAULT 14,
  ADD COLUMN IF NOT EXISTS max_chambres integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS max_utilisateurs integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS max_reservations_mois integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS module_finances boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS module_statistiques boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS module_facturation boolean NOT NULL DEFAULT false;

-- Helpful indexes for SaaS reporting
CREATE INDEX IF NOT EXISTS idx_hotels_statut ON public.hotels(statut);
CREATE INDEX IF NOT EXISTS idx_hotels_plan ON public.hotels(plan);
CREATE INDEX IF NOT EXISTS idx_hotels_date_fin_abonnement ON public.hotels(date_fin_abonnement);