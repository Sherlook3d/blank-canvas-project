// ============================================
// ADMIN HELPERS - Socle pour le dashboard SaaS admin
// Adapté au projet actuel (client Supabase, types simples)
// ============================================

import { supabase } from "@/integrations/supabase/client";

// ============================================
// TYPES
// ============================================

export interface AdminLog {
  id: string;
  admin_email: string;
  admin_name?: string;
  action: string;
  action_label: string;
  target_hotel_id?: string;
  target_hotel_name?: string;
  details: Record<string, any>;
  created_at: string;
}

// Statistiques globales pour les cards en haut du dashboard admin
export interface AdminStats {
  total_hotels: number;
  hotels_actifs: number;
  hotels_trial: number;
  hotels_suspendus: number;
  hotels_basic: number;
  hotels_premium: number;
  hotels_enterprise: number;
  revenu_mensuel: number;
  nouveaux_ce_mois: number;
}

// ============================================
// VÉRIFICATION DES PERMISSIONS
// ============================================

/**
 * Vérifie si l'utilisateur connecté est un admin SaaS
 *
 * Règle actuelle :
 *  - soit le JWT contient user_metadata.role === 'super_admin'
 *  - soit l'utilisateur a une entrée active dans la table public.admin_users
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Option 1 : Vérifier via user_metadata (claim JWT)
    if (user.user_metadata?.role === "super_admin") {
      return true;
    }

    // Option 2 : Vérifier via la table admin_users
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("actif", true)
      .maybeSingle();

    if (error) {
      console.error("Erreur isAdmin (admin_users):", error.message);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Erreur isAdmin:", error);
    return false;
  }
}

/**
 * Lève une erreur si l'utilisateur n'est pas admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Accès refusé : permissions administrateur requises");
  }
}

// ============================================
// LOGGING - socle minimal (pour usage futur)
// ============================================

interface LogOptions {
  action: string;
  actionLabel: string;
  targetHotelId?: string;
  targetHotelName?: string;
  details?: Record<string, any>;
}

/**
 * Enregistre une action admin dans la table admin_logs.
 * Peut être utilisé plus tard dans toutes les actions du dashboard.
 */
export async function logAdminAction({
  action,
  actionLabel,
  targetHotelId,
  targetHotelName,
  details = {},
}: LogOptions): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const adminEmail = (user.email || user.user_metadata?.email || "").toString();
    const adminName = (user.user_metadata?.name || user.user_metadata?.nom || "").toString();

    await supabase.from("admin_logs").insert({
      admin_user_id: user.id,
      admin_email: adminEmail,
      admin_name: adminName,
      action,
      action_label: actionLabel,
      target_hotel_id: targetHotelId ?? null,
      target_hotel_name: targetHotelName ?? null,
      details,
    });
  } catch (error) {
    console.error("Erreur logAdminAction:", error);
    // On ne bloque jamais l'UX sur un problème de log
  }
}
