// ============================================
// 🏨 HOTELMANAGER - HOOKS COMPTES CLIENTS
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export type CompteStatut = 'Ouvert' | 'Soldé' | 'Dette';
export type LigneType = 'Nuitée' | 'Restaurant' | 'Minibar' | 'Blanchisserie' | 'Parking' | 'Spa' | 'Téléphone' | 'Autre';
export type MethodePaiement = 'Espèces' | 'Carte Bancaire' | 'Mobile Money' | 'Virement' | 'Acompte';

export interface CompteClient {
  id: string;
  reservation_id: string | null;
  client_id: string;
  hotel_id: string;
  numero: string;
  total_facture: number;
  total_paye: number;
  solde: number;
  statut: CompteStatut;
  date_ouverture: string;
  date_cloture: string | null;
  created_by: string | null;
  created_at: string;
  // Relations
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    vip: boolean | null;
  };
  reservation?: {
    id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    status: string;
    room?: {
      id: string;
      number: string;
      type: string;
    };
  };
  lignes?: LigneCompte[];
  paiements?: PaiementCompte[];
}

export interface LigneCompte {
  id: string;
  compte_id: string;
  date_ligne: string;
  type: LigneType;
  description: string | null;
  montant: number;
  ajoute_par: string | null;
  created_at: string;
}

export interface PaiementCompte {
  id: string;
  compte_id: string;
  montant: number;
  methode: MethodePaiement;
  reference: string | null;
  remarque: string | null;
  date_paiement: string;
  recu_par: string | null;
  created_at: string;
}

export interface NoteClient {
  id: string;
  client_id: string;
  hotel_id: string;
  type: 'Important' | 'Préférence' | 'Info';
  titre: string;
  contenu: string | null;
  alerte_checkin: boolean;
  created_by: string | null;
  created_at: string;
}

export const useComptes = () => {
  const { user, profile } = useAuth();
  const [comptes, setComptes] = useState<CompteClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hotelId = profile?.hotel_id;

  // Fetch all comptes for the hotel
  const fetchComptes = useCallback(async () => {
    if (!hotelId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comptes_clients')
        .select(`
          *,
          client:clients(id, first_name, last_name, email, phone, vip),
          reservation:reservations!comptes_clients_reservation_id_fkey(
            id, room_id, check_in, check_out, status,
            room:rooms(id, number, type)
          ),
          lignes:lignes_compte(*),
          paiements:paiements_compte(*)
        `)
        .eq('hotel_id', hotelId)
        .order('date_ouverture', { ascending: false });

      if (error) throw error;
      setComptes((data || []) as unknown as CompteClient[]);
    } catch (error: any) {
      console.error('Error fetching comptes:', error);
      toast.error('Erreur lors du chargement des comptes');
    } finally {
      setIsLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchComptes();
  }, [fetchComptes]);

  // Get comptes ouverts (not soldés)
  const comptesOuverts = comptes.filter(c => c.statut !== 'Soldé');

  // Get stats
  const getStats = useCallback(() => {
    const ouverts = comptes.filter(c => c.statut !== 'Soldé');
    return {
      nbComptesOuverts: ouverts.length,
      totalARecevoir: ouverts.reduce((sum, c) => sum + (c.solde || 0), 0),
      totalEnCours: ouverts.reduce((sum, c) => sum + (c.total_facture || 0), 0),
    };
  }, [comptes]);

  // Create compte for check-in
  const creerCompte = useCallback(async (
    reservationId: string,
    clientId: string,
    prixNuitee: number,
    nbNuits: number,
    acompte: number = 0
  ) => {
    if (!hotelId || !user?.id) {
      toast.error('Session invalide');
      return null;
    }

    try {
      // 1. Create the compte
      const { data: nouveauCompte, error: erreurCompte } = await supabase
        .from('comptes_clients')
        .insert({
          reservation_id: reservationId,
          client_id: clientId,
          hotel_id: hotelId,
          created_by: user.id
        })
        .select()
        .single();

      if (erreurCompte) throw erreurCompte;

      // 2. Add nuitées as lignes
      const nuitees = [];
      for (let i = 0; i < nbNuits; i++) {
        nuitees.push({
          compte_id: nouveauCompte.id,
          type: 'Nuitée' as LigneType,
          description: `Nuitée ${i + 1}`,
          montant: prixNuitee,
          ajoute_par: user.id
        });
      }

      if (nuitees.length > 0) {
        const { error: erreurLignes } = await supabase
          .from('lignes_compte')
          .insert(nuitees);

        if (erreurLignes) throw erreurLignes;
      }

      // 3. If acompte, register it
      if (acompte > 0) {
        const { error: erreurAcompte } = await supabase
          .from('paiements_compte')
          .insert({
            compte_id: nouveauCompte.id,
            montant: acompte,
            methode: 'Acompte' as MethodePaiement,
            remarque: 'Acompte réservation',
            recu_par: user.id
          });

        if (erreurAcompte) throw erreurAcompte;
      }

      // 4. Link compte to reservation
      const { error: erreurLink } = await supabase
        .from('reservations')
        .update({ compte_id: nouveauCompte.id })
        .eq('id', reservationId);

      if (erreurLink) throw erreurLink;

      toast.success(`Compte ${nouveauCompte.numero} créé !`);
      await fetchComptes();
      return nouveauCompte;

    } catch (error: any) {
      console.error('Error creating compte:', error);
      toast.error('Erreur lors de la création du compte');
      return null;
    }
  }, [hotelId, user?.id, fetchComptes]);

  // Add consommation
  const ajouterConsommation = useCallback(async (
    compteId: string,
    type: LigneType,
    montant: number,
    description?: string
  ) => {
    if (!user?.id) {
      toast.error('Session invalide');
      return false;
    }

    try {
      const { error } = await supabase
        .from('lignes_compte')
        .insert({
          compte_id: compteId,
          type,
          description: description || null,
          montant,
          ajoute_par: user.id
        });

      if (error) throw error;

      toast.success(`${montant.toLocaleString()} Ar ajouté au compte`);
      await fetchComptes();
      return true;

    } catch (error: any) {
      console.error('Error adding consommation:', error);
      toast.error("Erreur lors de l'ajout");
      return false;
    }
  }, [user?.id, fetchComptes]);

  // Encaisser paiement
  const encaisserPaiement = useCallback(async (
    compteId: string,
    montant: number,
    methode: MethodePaiement,
    reference?: string,
    remarque?: string
  ) => {
    if (!user?.id) {
      toast.error('Session invalide');
      return false;
    }

    try {
      // Get current solde
      const compte = comptes.find(c => c.id === compteId);
      
      const { error } = await supabase
        .from('paiements_compte')
        .insert({
          compte_id: compteId,
          montant,
          methode,
          reference: reference || null,
          remarque: remarque || null,
          recu_par: user.id
        });

      if (error) throw error;

      const nouveauSolde = (compte?.solde || 0) - montant;
      
      if (nouveauSolde <= 0) {
        toast.success('Compte soldé ! Merci');
      } else {
        toast.success(`Paiement enregistré ! Reste: ${nouveauSolde.toLocaleString()} Ar`);
      }
      
      await fetchComptes();
      return true;

    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error("Erreur lors de l'encaissement");
      return false;
    }
  }, [user?.id, comptes, fetchComptes]);

  // Get compte details
  const getCompteDetails = useCallback(async (compteId: string): Promise<CompteClient | null> => {
    try {
      const { data, error } = await supabase
        .from('comptes_clients')
        .select(`
          *,
          client:clients(id, first_name, last_name, email, phone, vip),
          reservation:reservations!comptes_clients_reservation_id_fkey(
            id, room_id, check_in, check_out, status,
            room:rooms(id, number, type)
          ),
          lignes:lignes_compte(*),
          paiements:paiements_compte(*)
        `)
        .eq('id', compteId)
        .single();

      if (error) throw error;
      return data as unknown as CompteClient;

    } catch (error: any) {
      console.error('Error fetching compte details:', error);
      return null;
    }
  }, []);

  // Close compte with debt (create note)
  const cloturerAvecDette = useCallback(async (
    compteId: string,
    clientId: string,
    montant: number
  ) => {
    if (!hotelId || !user?.id) return false;

    try {
      // Create alert note
      await supabase
        .from('notes_clients')
        .insert({
          client_id: clientId,
          hotel_id: hotelId,
          type: 'Important',
          titre: `Dette de ${montant.toLocaleString()} Ar`,
          contenu: `Client parti sans payer le solde de ${montant.toLocaleString()} Ar. Date: ${new Date().toLocaleDateString()}`,
          alerte_checkin: true,
          created_by: user.id
        });

      // Update compte status
      await supabase
        .from('comptes_clients')
        .update({ statut: 'Dette' })
        .eq('id', compteId);

      toast.warning(`Dette de ${montant.toLocaleString()} Ar enregistrée`);
      await fetchComptes();
      return true;

    } catch (error: any) {
      console.error('Error closing with debt:', error);
      toast.error('Erreur lors de la clôture');
      return false;
    }
  }, [hotelId, user?.id, fetchComptes]);

  // Get client notes
  const getNotesClient = useCallback(async (clientId: string): Promise<NoteClient[]> => {
    try {
      const { data, error } = await supabase
        .from('notes_clients')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as NoteClient[];

    } catch (error: any) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }, []);

  // Get client comptes history
  const getComptesClient = useCallback(async (clientId: string): Promise<CompteClient[]> => {
    try {
      const { data, error } = await supabase
        .from('comptes_clients')
        .select(`
          *,
          reservation:reservations!comptes_clients_reservation_id_fkey(
            id, room_id, check_in, check_out, status,
            room:rooms(id, number, type)
          ),
          lignes:lignes_compte(*),
          paiements:paiements_compte(*)
        `)
        .eq('client_id', clientId)
        .order('date_ouverture', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as CompteClient[];

    } catch (error: any) {
      console.error('Error fetching client comptes:', error);
      return [];
    }
  }, []);

  // Pay client debt directly (reduce argent_du)
  const encaisserDetteClient = useCallback(async (
    clientId: string,
    montant: number,
    methode: MethodePaiement,
    reference?: string
  ) => {
    if (!user?.id) {
      toast.error('Session invalide');
      return false;
    }

    try {
      // Get current client debt
      const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('argent_du, first_name, last_name')
        .eq('id', clientId)
        .single();

      if (fetchError) throw fetchError;

      const currentDebt = client?.argent_du || 0;
      const newDebt = Math.max(0, currentDebt - montant);

      // Update client debt
      const { error: updateError } = await supabase
        .from('clients')
        .update({ argent_du: newDebt })
        .eq('id', clientId);

      if (updateError) throw updateError;

      if (newDebt <= 0) {
        toast.success(`Dette soldée pour ${client?.first_name} ${client?.last_name} !`);
      } else {
        toast.success(`Paiement enregistré ! Reste: ${formatMontant(newDebt)}`);
      }
      
      return true;

    } catch (error: any) {
      console.error('Error paying client debt:', error);
      toast.error("Erreur lors de l'encaissement");
      return false;
    }
  }, [user?.id]);

  return {
    comptes,
    comptesOuverts,
    isLoading,
    refreshComptes: fetchComptes,
    getStats,
    creerCompte,
    ajouterConsommation,
    encaisserPaiement,
    encaisserDetteClient,
    getCompteDetails,
    cloturerAvecDette,
    getNotesClient,
    getComptesClient,
  };
};

// Utility functions
export const formatMontant = (montant: number): string => {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' Ar';
};

export const getIconType = (type: LigneType): string => {
  const icons: Record<LigneType, string> = {
    'Nuitée': '🛏️',
    'Restaurant': '🍽️',
    'Minibar': '🍺',
    'Blanchisserie': '🧺',
    'Parking': '🚗',
    'Spa': '💆',
    'Téléphone': '📞',
    'Autre': '➕'
  };
  return icons[type];
};

export const getIconMethode = (methode: MethodePaiement): string => {
  const icons: Record<MethodePaiement, string> = {
    'Espèces': '💵',
    'Carte Bancaire': '💳',
    'Mobile Money': '📱',
    'Virement': '🏦',
    'Acompte': '💰'
  };
  return icons[methode];
};
