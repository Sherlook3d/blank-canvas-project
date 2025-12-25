export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          argent_du: number | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string
          hotel_id: string
          id: string
          id_number: string | null
          id_type: string | null
          last_name: string
          nationality: string | null
          nb_sejours: number | null
          notes: string | null
          phone: string | null
          total_depense: number | null
          updated_at: string
          vip: boolean | null
        }
        Insert: {
          address?: string | null
          argent_du?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          hotel_id: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          last_name: string
          nationality?: string | null
          nb_sejours?: number | null
          notes?: string | null
          phone?: string | null
          total_depense?: number | null
          updated_at?: string
          vip?: boolean | null
        }
        Update: {
          address?: string | null
          argent_du?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          hotel_id?: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          last_name?: string
          nationality?: string | null
          nb_sejours?: number | null
          notes?: string | null
          phone?: string | null
          total_depense?: number | null
          updated_at?: string
          vip?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      comptes_clients: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          date_cloture: string | null
          date_ouverture: string | null
          hotel_id: string
          id: string
          numero: string | null
          reservation_id: string | null
          solde: number | null
          statut: string | null
          total_facture: number | null
          total_paye: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_cloture?: string | null
          date_ouverture?: string | null
          hotel_id: string
          id?: string
          numero?: string | null
          reservation_id?: string | null
          solde?: number | null
          statut?: string | null
          total_facture?: number | null
          total_paye?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_cloture?: string | null
          date_ouverture?: string | null
          hotel_id?: string
          id?: string
          numero?: string | null
          reservation_id?: string | null
          solde?: number | null
          statut?: string | null
          total_facture?: number | null
          total_paye?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comptes_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comptes_clients_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comptes_clients_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lignes_compte: {
        Row: {
          ajoute_par: string | null
          compte_id: string
          created_at: string | null
          date_ligne: string | null
          description: string | null
          id: string
          montant: number
          type: string
        }
        Insert: {
          ajoute_par?: string | null
          compte_id: string
          created_at?: string | null
          date_ligne?: string | null
          description?: string | null
          id?: string
          montant: number
          type: string
        }
        Update: {
          ajoute_par?: string | null
          compte_id?: string
          created_at?: string | null
          date_ligne?: string | null
          description?: string | null
          id?: string
          montant?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lignes_compte_compte_id_fkey"
            columns: ["compte_id"]
            isOneToOne: false
            referencedRelation: "comptes_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notes_clients: {
        Row: {
          alerte_checkin: boolean | null
          client_id: string
          contenu: string | null
          created_at: string | null
          created_by: string | null
          hotel_id: string
          id: string
          titre: string
          type: string | null
        }
        Insert: {
          alerte_checkin?: boolean | null
          client_id: string
          contenu?: string | null
          created_at?: string | null
          created_by?: string | null
          hotel_id: string
          id?: string
          titre: string
          type?: string | null
        }
        Update: {
          alerte_checkin?: boolean | null
          client_id?: string
          contenu?: string | null
          created_at?: string | null
          created_by?: string | null
          hotel_id?: string
          id?: string
          titre?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_clients_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements_compte: {
        Row: {
          compte_id: string
          created_at: string | null
          date_paiement: string | null
          id: string
          methode: string
          montant: number
          recu_par: string | null
          reference: string | null
          remarque: string | null
        }
        Insert: {
          compte_id: string
          created_at?: string | null
          date_paiement?: string | null
          id?: string
          methode: string
          montant: number
          recu_par?: string | null
          reference?: string | null
          remarque?: string | null
        }
        Update: {
          compte_id?: string
          created_at?: string | null
          date_paiement?: string | null
          id?: string
          methode?: string
          montant?: number
          recu_par?: string | null
          reference?: string | null
          remarque?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paiements_compte_compte_id_fkey"
            columns: ["compte_id"]
            isOneToOne: false
            referencedRelation: "comptes_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          hotel_id: string | null
          id: string
          name: string
          status: string
          theme: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          hotel_id?: string | null
          id: string
          name: string
          status?: string
          theme?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          hotel_id?: string | null
          id?: string
          name?: string
          status?: string
          theme?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          acompte: number | null
          check_in: string
          check_out: string
          client_id: string
          compte_id: string | null
          created_at: string
          created_by: string | null
          hotel_id: string
          id: string
          notes: string | null
          payment_status: string
          room_id: string
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          acompte?: number | null
          check_in: string
          check_out: string
          client_id: string
          compte_id?: string | null
          created_at?: string
          created_by?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          payment_status?: string
          room_id: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Update: {
          acompte?: number | null
          check_in?: string
          check_out?: string
          client_id?: string
          compte_id?: string | null
          created_at?: string
          created_by?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          payment_status?: string
          room_id?: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_compte_id_fkey"
            columns: ["compte_id"]
            isOneToOne: false
            referencedRelation: "comptes_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_access: boolean
          created_at: string
          hotel_id: string
          id: string
          page_key: string
          role: string
          updated_at: string
        }
        Insert: {
          can_access?: boolean
          created_at?: string
          hotel_id: string
          id?: string
          page_key: string
          role: string
          updated_at?: string
        }
        Update: {
          can_access?: boolean
          created_at?: string
          hotel_id?: string
          id?: string
          page_key?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          description: string | null
          floor: number | null
          hotel_id: string
          id: string
          number: string
          price_per_night: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          description?: string | null
          floor?: number | null
          hotel_id: string
          id?: string
          number: string
          price_per_night?: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          description?: string | null
          floor?: number | null
          hotel_id?: string
          id?: string
          number?: string
          price_per_night?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_hotel_id: { Args: { _user_id: string }; Returns: string }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
