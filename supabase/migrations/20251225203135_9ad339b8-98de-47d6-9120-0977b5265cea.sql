-- ============================================
-- 🏨 HOTELMANAGER - SYSTÈME DE COMPTES CLIENTS
-- ============================================

-- ============================================
-- 1. TABLE "comptes_clients"
-- ============================================

CREATE TABLE IF NOT EXISTS public.comptes_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Liens
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  hotel_id UUID REFERENCES public.hotels(id) NOT NULL,
  
  -- Numéro auto (CPT-2025-001)
  numero TEXT UNIQUE,
  
  -- Montants (calculés automatiquement par triggers)
  total_facture DECIMAL(10,2) DEFAULT 0,
  total_paye DECIMAL(10,2) DEFAULT 0,
  solde DECIMAL(10,2) DEFAULT 0,
  
  -- Statut
  statut TEXT DEFAULT 'Ouvert' CHECK (statut IN ('Ouvert', 'Soldé', 'Dette')),
  
  -- Dates
  date_ouverture TIMESTAMPTZ DEFAULT NOW(),
  date_cloture TIMESTAMPTZ,
  
  -- Audit
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_comptes_reservation ON public.comptes_clients(reservation_id);
CREATE INDEX IF NOT EXISTS idx_comptes_client ON public.comptes_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_comptes_statut ON public.comptes_clients(statut);
CREATE INDEX IF NOT EXISTS idx_comptes_hotel ON public.comptes_clients(hotel_id);

-- Fonction génération numéro auto (CPT-2025-001, CPT-2025-002, etc.)
CREATE OR REPLACE FUNCTION public.generer_numero_compte()
RETURNS TRIGGER AS $$
DECLARE
  annee TEXT;
  compteur INT;
BEGIN
  IF NEW.numero IS NULL THEN
    annee := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 'CPT-' || annee || '-(.*)') AS INT)), 0) + 1
    INTO compteur
    FROM public.comptes_clients
    WHERE numero LIKE 'CPT-' || annee || '-%';
    
    NEW.numero := 'CPT-' || annee || '-' || LPAD(compteur::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_numero_compte ON public.comptes_clients;
CREATE TRIGGER trigger_numero_compte
  BEFORE INSERT ON public.comptes_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.generer_numero_compte();

-- ============================================
-- 2. TABLE "lignes_compte"
-- ============================================

CREATE TABLE IF NOT EXISTS public.lignes_compte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compte_id UUID REFERENCES public.comptes_clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Détails
  date_ligne TIMESTAMPTZ DEFAULT NOW(),
  type TEXT CHECK (type IN ('Nuitée', 'Restaurant', 'Minibar', 'Blanchisserie', 'Parking', 'Spa', 'Téléphone', 'Autre')) NOT NULL,
  description TEXT,
  montant DECIMAL(10,2) NOT NULL,
  
  -- Audit
  ajoute_par UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lignes_compte ON public.lignes_compte(compte_id);
CREATE INDEX IF NOT EXISTS idx_lignes_date ON public.lignes_compte(date_ligne);

-- Trigger : Quand on ajoute/modifie/supprime une ligne → MAJ total_facture du compte
CREATE OR REPLACE FUNCTION public.maj_total_facture()
RETURNS TRIGGER AS $$
DECLARE
  cid UUID;
  nouveau_total DECIMAL(10,2);
BEGIN
  cid := COALESCE(NEW.compte_id, OLD.compte_id);
  
  IF cid IS NOT NULL THEN
    -- Calculer le nouveau total de toutes les lignes
    SELECT COALESCE(SUM(montant), 0) INTO nouveau_total
    FROM public.lignes_compte
    WHERE compte_id = cid;
    
    -- Mettre à jour le compte
    UPDATE public.comptes_clients
    SET 
      total_facture = nouveau_total,
      solde = nouveau_total - total_paye,
      statut = CASE
        WHEN nouveau_total - total_paye <= 0 THEN 'Soldé'
        WHEN total_paye > 0 THEN 'Ouvert'
        ELSE 'Ouvert'
      END,
      updated_at = NOW()
    WHERE id = cid;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_maj_total ON public.lignes_compte;
CREATE TRIGGER trigger_maj_total
  AFTER INSERT OR UPDATE OR DELETE ON public.lignes_compte
  FOR EACH ROW
  EXECUTE FUNCTION public.maj_total_facture();

-- ============================================
-- 3. TABLE "paiements_compte"
-- ============================================

CREATE TABLE IF NOT EXISTS public.paiements_compte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compte_id UUID REFERENCES public.comptes_clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Détails paiement
  montant DECIMAL(10,2) NOT NULL,
  methode TEXT CHECK (methode IN ('Espèces', 'Carte Bancaire', 'Mobile Money', 'Virement', 'Acompte')) NOT NULL,
  reference TEXT,
  remarque TEXT,
  
  -- Date et qui
  date_paiement TIMESTAMPTZ DEFAULT NOW(),
  recu_par UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paiements_compte ON public.paiements_compte(compte_id);

-- Trigger : Quand on ajoute/modifie/supprime un paiement → MAJ total_paye du compte
CREATE OR REPLACE FUNCTION public.maj_montant_paye()
RETURNS TRIGGER AS $$
DECLARE
  cid UUID;
  nouveau_paye DECIMAL(10,2);
  total_fact DECIMAL(10,2);
BEGIN
  cid := COALESCE(NEW.compte_id, OLD.compte_id);
  
  IF cid IS NOT NULL THEN
    -- Récupérer le total facturé
    SELECT total_facture INTO total_fact FROM public.comptes_clients WHERE id = cid;
    
    -- Calculer le nouveau total payé
    SELECT COALESCE(SUM(montant), 0) INTO nouveau_paye
    FROM public.paiements_compte
    WHERE compte_id = cid;
    
    -- Mettre à jour le compte
    UPDATE public.comptes_clients
    SET 
      total_paye = nouveau_paye,
      solde = total_facture - nouveau_paye,
      statut = CASE
        WHEN total_facture - nouveau_paye <= 0 THEN 'Soldé'
        WHEN nouveau_paye > 0 THEN 'Ouvert'
        ELSE 'Ouvert'
      END,
      date_cloture = CASE
        WHEN total_facture - nouveau_paye <= 0 THEN NOW()
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = cid;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_maj_paye ON public.paiements_compte;
CREATE TRIGGER trigger_maj_paye
  AFTER INSERT OR UPDATE OR DELETE ON public.paiements_compte
  FOR EACH ROW
  EXECUTE FUNCTION public.maj_montant_paye();

-- ============================================
-- 4. TABLE "notes_clients"
-- ============================================

CREATE TABLE IF NOT EXISTS public.notes_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  hotel_id UUID REFERENCES public.hotels(id) NOT NULL,
  
  type TEXT CHECK (type IN ('Important', 'Préférence', 'Info')) DEFAULT 'Info',
  titre TEXT NOT NULL,
  contenu TEXT,
  
  alerte_checkin BOOLEAN DEFAULT false,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_client ON public.notes_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_notes_hotel ON public.notes_clients(hotel_id);

-- ============================================
-- 5. MODIFICATIONS TABLE "reservations"
-- ============================================

DO $$
BEGIN
  -- Lien vers le compte
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'reservations' AND column_name = 'compte_id'
  ) THEN
    ALTER TABLE public.reservations ADD COLUMN compte_id UUID REFERENCES public.comptes_clients(id);
  END IF;
  
  -- Acompte initial
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'reservations' AND column_name = 'acompte'
  ) THEN
    ALTER TABLE public.reservations ADD COLUMN acompte DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 6. MODIFICATIONS TABLE "clients"
-- ============================================

DO $$
BEGIN
  -- Total dépensé (tous séjours confondus)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'total_depense'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN total_depense DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Argent qu'il doit encore
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'argent_du'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN argent_du DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Nombre de séjours
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'nb_sejours'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN nb_sejours INTEGER DEFAULT 0;
  END IF;
END $$;

-- Trigger MAJ stats client (quand compte change)
CREATE OR REPLACE FUNCTION public.maj_stats_client()
RETURNS TRIGGER AS $$
DECLARE
  cid UUID;
BEGIN
  cid := COALESCE(NEW.client_id, OLD.client_id);
  
  IF cid IS NOT NULL THEN
    UPDATE public.clients
    SET 
      -- Total dépensé = somme des comptes soldés
      total_depense = COALESCE((
        SELECT SUM(total_facture) 
        FROM public.comptes_clients 
        WHERE client_id = cid AND statut = 'Soldé'
      ), 0),
      -- Argent dû = somme des soldes > 0
      argent_du = COALESCE((
        SELECT SUM(solde) 
        FROM public.comptes_clients 
        WHERE client_id = cid AND solde > 0
      ), 0),
      -- Nombre de séjours = comptes soldés
      nb_sejours = COALESCE((
        SELECT COUNT(*) 
        FROM public.comptes_clients 
        WHERE client_id = cid AND statut = 'Soldé'
      ), 0),
      updated_at = NOW()
    WHERE id = cid;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_stats_client ON public.comptes_clients;
CREATE TRIGGER trigger_stats_client
  AFTER INSERT OR UPDATE OR DELETE ON public.comptes_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.maj_stats_client();

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.comptes_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_compte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements_compte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes_clients ENABLE ROW LEVEL SECURITY;

-- Comptes clients policies
CREATE POLICY "Users can view hotel comptes" ON public.comptes_clients
  FOR SELECT USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can create hotel comptes" ON public.comptes_clients
  FOR INSERT WITH CHECK (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update hotel comptes" ON public.comptes_clients
  FOR UPDATE USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can delete hotel comptes" ON public.comptes_clients
  FOR DELETE USING (hotel_id = get_user_hotel_id(auth.uid()));

-- Lignes compte policies (via join with comptes_clients)
CREATE POLICY "Users can view hotel lignes" ON public.lignes_compte
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.comptes_clients cc 
      WHERE cc.id = lignes_compte.compte_id 
      AND cc.hotel_id = get_user_hotel_id(auth.uid())
    )
  );

CREATE POLICY "Users can create hotel lignes" ON public.lignes_compte
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.comptes_clients cc 
      WHERE cc.id = lignes_compte.compte_id 
      AND cc.hotel_id = get_user_hotel_id(auth.uid())
    )
  );

CREATE POLICY "Users can update hotel lignes" ON public.lignes_compte
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.comptes_clients cc 
      WHERE cc.id = lignes_compte.compte_id 
      AND cc.hotel_id = get_user_hotel_id(auth.uid())
    )
  );

CREATE POLICY "Users can delete hotel lignes" ON public.lignes_compte
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.comptes_clients cc 
      WHERE cc.id = lignes_compte.compte_id 
      AND cc.hotel_id = get_user_hotel_id(auth.uid())
    )
  );

-- Paiements compte policies (via join with comptes_clients)
CREATE POLICY "Users can view hotel paiements" ON public.paiements_compte
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.comptes_clients cc 
      WHERE cc.id = paiements_compte.compte_id 
      AND cc.hotel_id = get_user_hotel_id(auth.uid())
    )
  );

CREATE POLICY "Users can create hotel paiements" ON public.paiements_compte
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.comptes_clients cc 
      WHERE cc.id = paiements_compte.compte_id 
      AND cc.hotel_id = get_user_hotel_id(auth.uid())
    )
  );

CREATE POLICY "Users can update hotel paiements" ON public.paiements_compte
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.comptes_clients cc 
      WHERE cc.id = paiements_compte.compte_id 
      AND cc.hotel_id = get_user_hotel_id(auth.uid())
    )
  );

CREATE POLICY "Users can delete hotel paiements" ON public.paiements_compte
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.comptes_clients cc 
      WHERE cc.id = paiements_compte.compte_id 
      AND cc.hotel_id = get_user_hotel_id(auth.uid())
    )
  );

-- Notes clients policies
CREATE POLICY "Users can view hotel notes" ON public.notes_clients
  FOR SELECT USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can create hotel notes" ON public.notes_clients
  FOR INSERT WITH CHECK (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update hotel notes" ON public.notes_clients
  FOR UPDATE USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can delete hotel notes" ON public.notes_clients
  FOR DELETE USING (hotel_id = get_user_hotel_id(auth.uid()));