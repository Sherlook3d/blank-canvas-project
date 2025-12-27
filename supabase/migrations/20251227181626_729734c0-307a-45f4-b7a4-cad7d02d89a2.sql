-- ADMIN SAAS - socle admin: tables admin_logs et admin_users

-- ============================================
-- TABLE : admin_logs (Historique des actions admin)
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Qui a fait l'action
  admin_user_id UUID REFERENCES auth.users(id),
  admin_email TEXT NOT NULL,
  admin_name TEXT,
  
  -- Quelle action
  action TEXT NOT NULL, -- 'create_hotel', 'suspend_hotel', 'change_plan', 'delete_hotel', etc.
  action_label TEXT, -- Label lisible : "Création d'hôtel", "Suspension", etc.
  
  -- Sur qui/quoi
  target_hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
  target_hotel_name TEXT,
  
  -- Détails de l'action (JSON flexible)
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Métadonnées
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON public.admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_hotel ON public.admin_logs(target_hotel_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_date ON public.admin_logs(created_at DESC);

COMMENT ON TABLE public.admin_logs IS 'Historique de toutes les actions effectuées par les administrateurs du SaaS';

-- ============================================
-- TABLE : admin_users (Liste des super-admins SaaS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  nom TEXT,
  prenom TEXT,
  email TEXT NOT NULL UNIQUE,
  
  role TEXT DEFAULT 'admin', -- 'super_admin', 'admin', 'support'
  
  -- Permissions
  can_create_hotels BOOLEAN DEFAULT true,
  can_delete_hotels BOOLEAN DEFAULT false,
  can_view_finances BOOLEAN DEFAULT true,
  can_impersonate BOOLEAN DEFAULT false,
  
  actif BOOLEAN DEFAULT true,
  derniere_connexion TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_actif ON public.admin_users(actif);

COMMENT ON TABLE public.admin_users IS 'Liste des utilisateurs ayant des permissions d''administration du SaaS';

-- ============================================
-- RLS : activer la sécurité sur les tables admin
-- ============================================

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Politique simple basée sur le claim JWT `role = super_admin` pour commencer.
-- (On affinera ensuite si besoin en utilisant admin_users + has_role spécifique.)

DROP POLICY IF EXISTS "Admins manage admin_logs" ON public.admin_logs;
CREATE POLICY "Admins manage admin_logs" ON public.admin_logs
  FOR ALL
  USING ((auth.jwt() ->> 'role')::text = 'super_admin')
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'super_admin');

DROP POLICY IF EXISTS "Admins manage admin_users" ON public.admin_users;
CREATE POLICY "Admins manage admin_users" ON public.admin_users
  FOR ALL
  USING ((auth.jwt() ->> 'role')::text = 'super_admin')
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'super_admin');
