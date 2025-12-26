// ============================================
// MULTI-TENANT HELPERS (adaptés au schéma actuel)
// Gestion automatique de hotel_id + inscription SaaS
// ============================================

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// ============================================
// TYPES
// ============================================

export interface HotelTenant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  plan: "basic" | "premium" | "enterprise" | "trial";
  statut: "actif" | "suspendu" | "annule" | "trial" | "expire";
  max_chambres: number;
  max_utilisateurs: number;
  logo_url?: string | null;
  couleur_primaire?: string | null;
  prix_mensuel?: number | null;
  date_abonnement?: string | null;
}

export interface HotelContextType {
  hotel: HotelTenant | null;
  hotelId: string | null;
  loading: boolean;
  refreshHotel: () => Promise<void>;
}

// ============================================
// CONTEXT REACT POUR L'HÔTEL
// ============================================

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotel, setHotel] = useState<HotelTenant | null>(null);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotelInfo();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadHotelInfo();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHotelInfo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setHotel(null);
        setHotelId(null);
        setLoading(false);
        return;
      }

      // On récupère l'hôtel via la table profiles (id = auth.uid())
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("hotel_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.hotel_id) {
        setHotel(null);
        setHotelId(null);
        setLoading(false);
        return;
      }

      const resolvedHotelId = profile.hotel_id as string;
      setHotelId(resolvedHotelId);

      const { data: hotelData, error: hotelError } = await supabase
        .from("hotels")
        .select("*")
        .eq("id", resolvedHotelId)
        .maybeSingle();

      if (hotelError || !hotelData) {
        console.error("Erreur chargement hôtel:", hotelError);
        setHotel(null);
      } else {
        setHotel(hotelData as HotelTenant);
      }
    } catch (error) {
      console.error("Erreur loadHotelInfo:", error);
      setHotel(null);
      setHotelId(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshHotel() {
    await loadHotelInfo();
  }

  return (
    <HotelContext.Provider value={{ hotel, hotelId, loading, refreshHotel }}>
      {children}
    </HotelContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotel doit être utilisé dans un HotelProvider");
  }
  return context;
}

// ============================================
// FONCTIONS HELPER POUR LES REQUÊTES
// ============================================

/**
 * Récupère l'hotel_id de l'utilisateur connecté via profiles
 */
export async function getHotelId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("hotel_id")
    .eq("id", user.id)
    .maybeSingle();

  return (profile?.hotel_id as string | null) ?? null;
}

/**
 * Récupère les infos complètes de l'hôtel
 */
export async function getHotelInfo(): Promise<HotelTenant | null> {
  const hotelId = await getHotelId();
  if (!hotelId) return null;

  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", hotelId)
    .maybeSingle();

  if (error) {
    console.error("Erreur getHotelInfo:", error);
    return null;
  }

  return data as HotelTenant | null;
}

/**
 * Wrapper pour SELECT avec hotel_id automatique
 */
export async function queryWithHotel<T = any>(
  table: string,
  select: string = "*"
) {
  const hotelId = await getHotelId();
  if (!hotelId) {
    throw new Error("Hotel ID non trouvé. L'utilisateur doit être connecté.");
  }

  return supabase
    .from(table as any)
    .select(select)
    .eq("hotel_id", hotelId);
}

/**
 * Wrapper pour INSERT avec hotel_id automatique
 */
export async function insertWithHotel<T extends Record<string, any>>(
  table: string,
  data: Omit<T, "hotel_id"> | Omit<T, "hotel_id">[]
) {
  const hotelId = await getHotelId();
  if (!hotelId) {
    throw new Error("Hotel ID non trouvé. L'utilisateur doit être connecté.");
  }

  if (Array.isArray(data)) {
    const dataWithHotel = data.map((item) => ({ ...item, hotel_id: hotelId }));
    return supabase.from(table).insert(dataWithHotel);
  }

  return supabase
    .from(table)
    .insert({ ...data, hotel_id: hotelId });
}

/**
 * Wrapper pour UPDATE avec hotel_id automatique
 */
export async function updateWithHotel<T extends Record<string, any>>(
  table: string,
  match: Record<string, any>,
  data: Partial<Omit<T, "hotel_id">>
) {
  const hotelId = await getHotelId();
  if (!hotelId) {
    throw new Error("Hotel ID non trouvé. L'utilisateur doit être connecté.");
  }

  return supabase
    .from(table)
    .update(data)
    .eq("hotel_id", hotelId)
    .match(match);
}

/**
 * Wrapper pour DELETE avec hotel_id automatique
 */
export async function deleteWithHotel(
  table: string,
  match: Record<string, any>
) {
  const hotelId = await getHotelId();
  if (!hotelId) {
    throw new Error("Hotel ID non trouvé. L'utilisateur doit être connecté.");
  }

  return supabase
    .from(table)
    .delete()
    .eq("hotel_id", hotelId)
    .match(match);
}

/**
 * Limites de plan – chambres
 */
export async function canAddRoom(): Promise<{ allowed: boolean; message?: string }> {
  const hotel = await getHotelInfo();
  if (!hotel) {
    return { allowed: false, message: "Hôtel non trouvé" };
  }

  const { count } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("hotel_id", hotel.id);

  if ((count || 0) >= hotel.max_chambres) {
    return {
      allowed: false,
      message: `Limite de chambres atteinte (${hotel.max_chambres} max pour le plan ${hotel.plan}). Passez au plan supérieur.`,
    };
  }

  return { allowed: true };
}

/**
 * Statistiques rapides de l'hôtel
 */
export async function getHotelStats() {
  const hotelId = await getHotelId();
  if (!hotelId) {
    throw new Error("Hotel ID non trouvé");
  }

  const [
    { count: nbRooms },
    { count: nbReservations },
    { count: nbClients },
    { count: nbAccounts },
  ] = await Promise.all([
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("hotel_id", hotelId),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("hotel_id", hotelId),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("hotel_id", hotelId),
    supabase.from("comptes_clients").select("*", { count: "exact", head: true }).eq("hotel_id", hotelId),
  ]);

  return {
    nbRooms: nbRooms || 0,
    nbReservations: nbReservations || 0,
    nbClients: nbClients || 0,
    nbAccounts: nbAccounts || 0,
  };
}

// ============================================
// INSCRIPTION SAAS
// ============================================

export async function registerHotel(params: {
  hotelName: string;
  hotelAddress: string;
  hotelEmail: string;
  hotelPhone: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  plan: "basic" | "premium" | "enterprise";
}) {
  try {
    // 1. Créer l'hôtel dans Supabase
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .insert({
        name: params.hotelName,
        address: params.hotelAddress,
        email: params.hotelEmail,
        phone: params.hotelPhone,
        plan: params.plan,
        statut: "trial",
        max_chambres: params.plan === "basic" ? 20 : params.plan === "premium" ? 50 : 100,
        max_utilisateurs: params.plan === "basic" ? 3 : params.plan === "premium" ? 10 : 50,
        prix_mensuel: params.plan === "basic" ? 50 : params.plan === "premium" ? 100 : 200,
      })
      .select()
      .single();

    if (hotelError || !hotel) {
      throw new Error("Erreur création hôtel: " + (hotelError?.message ?? "inconnue"));
    }

    // 2. Créer l'utilisateur admin
    const { data: signupResult, error: userError } = await supabase.auth.signUp({
      email: params.adminEmail,
      password: params.adminPassword,
      options: {
        data: {
          name: params.adminName,
        },
        emailRedirectTo: window.location.origin + "/auth",
      },
    });

    if (userError || !signupResult.user) {
      // Rollback hôtel si échec création utilisateur
      await supabase.from("hotels").delete().eq("id", hotel.id);
      throw new Error("Erreur création utilisateur: " + (userError?.message ?? "inconnue"));
    }

    const userId = signupResult.user.id;

    // 3. Associer l'utilisateur à l'hôtel via profiles
    await supabase
      .from("profiles")
      .update({ hotel_id: hotel.id })
      .eq("id", userId);

    // 4. Donner le rôle owner à cet utilisateur
    await supabase.from("user_roles").insert({
      user_id: userId,
      role: "owner",
    });

    return {
      success: true,
      hotel,
      user: signupResult.user,
      message: "Inscription réussie ! Vérifiez votre email pour confirmer votre compte.",
    };
  } catch (error: any) {
    console.error("Erreur registerHotel:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'inscription",
    };
  }
}
