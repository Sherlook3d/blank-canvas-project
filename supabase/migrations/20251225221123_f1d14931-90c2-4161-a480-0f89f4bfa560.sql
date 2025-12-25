-- ============================================
-- 💰 MODULE FINANCIER - BASE DE DONNÉES
-- HotelManager - Gestion Financière Complète
-- ============================================

-- ============================================
-- TABLE: categories_depenses
-- ============================================

CREATE TABLE public.categories_depenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES public.hotels(id),
  nom TEXT NOT NULL,
  icon TEXT,
  couleur TEXT,
  ordre INTEGER DEFAULT 0,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.categories_depenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotel categories" ON public.categories_depenses
  FOR SELECT USING (hotel_id IS NULL OR hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert hotel categories" ON public.categories_depenses
  FOR INSERT WITH CHECK (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update hotel categories" ON public.categories_depenses
  FOR UPDATE USING (hotel_id = get_user_hotel_id(auth.uid()));

-- Données initiales (catégories globales sans hotel_id)
INSERT INTO public.categories_depenses (nom, icon, couleur, ordre) VALUES
  ('Salaires', '👥', '#3b82f6', 1),
  ('Électricité & Eau', '⚡', '#f59e0b', 2),
  ('Alimentation', '🍽️', '#10b981', 3),
  ('Fournitures & Entretien', '🧹', '#8b5cf6', 4),
  ('Réparations & Maintenance', '🔧', '#ef4444', 5),
  ('Téléphone & Internet', '📱', '#06b6d4', 6),
  ('Loyer', '🏢', '#ec4899', 7),
  ('Transport', '🚗', '#14b8a6', 8),
  ('Administratif', '📄', '#6366f1', 9),
  ('Marketing & Publicité', '📢', '#f97316', 10),
  ('Assurances', '🛡️', '#84cc16', 11),
  ('Taxes & Impôts', '💼', '#64748b', 12),
  ('Autres', '➕', '#9ca3af', 99);

-- ============================================
-- TABLE: depenses
-- ============================================

CREATE TABLE public.depenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  categorie_id UUID NOT NULL REFERENCES public.categories_depenses(id),
  montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  description TEXT NOT NULL,
  fournisseur TEXT,
  numero_facture TEXT,
  justificatif_url TEXT,
  moyen_paiement TEXT CHECK (moyen_paiement IN ('Espèces', 'Carte Bancaire', 'Chèque', 'Virement', 'Mobile Money')),
  note TEXT,
  validee BOOLEAN DEFAULT false,
  validee_par UUID,
  validee_le TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_depenses_date ON public.depenses(date DESC);
CREATE INDEX idx_depenses_categorie ON public.depenses(categorie_id);
CREATE INDEX idx_depenses_hotel ON public.depenses(hotel_id);

ALTER TABLE public.depenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotel depenses" ON public.depenses
  FOR SELECT USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert hotel depenses" ON public.depenses
  FOR INSERT WITH CHECK (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update hotel depenses" ON public.depenses
  FOR UPDATE USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can delete hotel depenses" ON public.depenses
  FOR DELETE USING (hotel_id = get_user_hotel_id(auth.uid()));

-- ============================================
-- TABLE: mouvements_tresorerie
-- ============================================

CREATE TABLE public.mouvements_tresorerie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('Entrée', 'Sortie')),
  montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  compte TEXT NOT NULL CHECK (compte IN ('Caisse', 'Banque')),
  categorie TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('Paiement', 'Dépense', 'Transfert', 'Autre')),
  reference_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tresorerie_date ON public.mouvements_tresorerie(date DESC);
CREATE INDEX idx_tresorerie_hotel ON public.mouvements_tresorerie(hotel_id);

ALTER TABLE public.mouvements_tresorerie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotel mouvements" ON public.mouvements_tresorerie
  FOR SELECT USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert hotel mouvements" ON public.mouvements_tresorerie
  FOR INSERT WITH CHECK (hotel_id = get_user_hotel_id(auth.uid()));

-- ============================================
-- TABLE: soldes_tresorerie
-- ============================================

CREATE TABLE public.soldes_tresorerie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id),
  date DATE NOT NULL,
  solde_caisse DECIMAL(10,2) NOT NULL DEFAULT 0,
  solde_banque DECIMAL(10,2) NOT NULL DEFAULT 0,
  entrees_jour DECIMAL(10,2) DEFAULT 0,
  sorties_jour DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, date)
);

CREATE INDEX idx_soldes_date ON public.soldes_tresorerie(date DESC);

ALTER TABLE public.soldes_tresorerie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotel soldes" ON public.soldes_tresorerie
  FOR SELECT USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert hotel soldes" ON public.soldes_tresorerie
  FOR INSERT WITH CHECK (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can update hotel soldes" ON public.soldes_tresorerie
  FOR UPDATE USING (hotel_id = get_user_hotel_id(auth.uid()));

-- ============================================
-- TABLE: relances_impayees
-- ============================================

CREATE TABLE public.relances_impayees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id),
  compte_client_id UUID NOT NULL REFERENCES public.comptes_clients(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  date_relance DATE NOT NULL DEFAULT CURRENT_DATE,
  type_relance TEXT CHECK (type_relance IN ('Email', 'SMS', 'Appel', 'Courrier', 'Visite')),
  montant_du DECIMAL(10,2) NOT NULL,
  message TEXT,
  note TEXT,
  reponse_client TEXT,
  engagement_paiement DATE,
  statut TEXT DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Promesse reçue', 'Payé', 'Sans réponse', 'Refus')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_relances_compte ON public.relances_impayees(compte_client_id);
CREATE INDEX idx_relances_hotel ON public.relances_impayees(hotel_id);

ALTER TABLE public.relances_impayees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotel relances" ON public.relances_impayees
  FOR SELECT USING (hotel_id = get_user_hotel_id(auth.uid()));

CREATE POLICY "Users can insert hotel relances" ON public.relances_impayees
  FOR INSERT WITH CHECK (hotel_id = get_user_hotel_id(auth.uid()));

-- ============================================
-- FUNCTION: calculer_solde_tresorerie
-- ============================================

CREATE OR REPLACE FUNCTION public.calculer_solde_tresorerie(
  p_hotel_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  solde_caisse DECIMAL(10,2),
  solde_banque DECIMAL(10,2),
  solde_total DECIMAL(10,2)
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN type = 'Entrée' AND compte = 'Caisse' THEN montant
        WHEN type = 'Sortie' AND compte = 'Caisse' THEN -montant
        ELSE 0
      END
    ), 0)::DECIMAL(10,2) as solde_caisse,
    COALESCE(SUM(
      CASE 
        WHEN type = 'Entrée' AND compte = 'Banque' THEN montant
        WHEN type = 'Sortie' AND compte = 'Banque' THEN -montant
        ELSE 0
      END
    ), 0)::DECIMAL(10,2) as solde_banque,
    COALESCE(SUM(
      CASE 
        WHEN type = 'Entrée' THEN montant
        WHEN type = 'Sortie' THEN -montant
        ELSE 0
      END
    ), 0)::DECIMAL(10,2) as solde_total
  FROM mouvements_tresorerie
  WHERE hotel_id = p_hotel_id AND date <= p_date;
END;
$$;

-- ============================================
-- TRIGGER: auto_update_depenses_timestamp
-- ============================================

CREATE OR REPLACE FUNCTION public.update_depenses_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_depenses_timestamp
  BEFORE UPDATE ON public.depenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_depenses_timestamp();

-- ============================================
-- TRIGGER: auto_create_mouvement_from_paiement
-- ============================================

CREATE OR REPLACE FUNCTION public.create_mouvement_from_paiement()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hotel_id UUID;
BEGIN
  -- Get hotel_id from compte_client
  SELECT hotel_id INTO v_hotel_id 
  FROM comptes_clients 
  WHERE id = NEW.compte_id;

  IF v_hotel_id IS NOT NULL THEN
    INSERT INTO mouvements_tresorerie (
      hotel_id,
      date,
      type,
      montant,
      compte,
      categorie,
      description,
      reference_type,
      reference_id,
      created_by
    ) VALUES (
      v_hotel_id,
      COALESCE(NEW.date_paiement::DATE, CURRENT_DATE),
      'Entrée',
      NEW.montant,
      CASE 
        WHEN NEW.methode = 'Espèces' THEN 'Caisse'
        ELSE 'Banque'
      END,
      'Recette Client',
      'Paiement compte client',
      'Paiement',
      NEW.id,
      NEW.recu_par
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_mouvement_from_paiement
  AFTER INSERT ON public.paiements_compte
  FOR EACH ROW
  EXECUTE FUNCTION public.create_mouvement_from_paiement();

-- ============================================
-- TRIGGER: auto_create_mouvement_from_depense
-- ============================================

CREATE OR REPLACE FUNCTION public.create_mouvement_from_depense()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO mouvements_tresorerie (
    hotel_id,
    date,
    type,
    montant,
    compte,
    categorie,
    description,
    reference_type,
    reference_id,
    created_by
  ) VALUES (
    NEW.hotel_id,
    NEW.date,
    'Sortie',
    NEW.montant,
    CASE 
      WHEN NEW.moyen_paiement = 'Espèces' THEN 'Caisse'
      ELSE 'Banque'
    END,
    'Dépense',
    NEW.description,
    'Dépense',
    NEW.id,
    NEW.created_by
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_mouvement_from_depense
  AFTER INSERT ON public.depenses
  FOR EACH ROW
  EXECUTE FUNCTION public.create_mouvement_from_depense();