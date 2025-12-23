import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'owner' | 'manager' | 'receptionist';

interface PagePermission {
  key: string;
  label: string;
  description: string;
}

const PAGES: PagePermission[] = [
  { key: 'dashboard', label: 'Tableau de bord', description: 'Vue d\'ensemble de l\'hôtel' },
  { key: 'chambres', label: 'Chambres', description: 'Gestion des chambres' },
  { key: 'reservations', label: 'Réservations', description: 'Gestion des réservations' },
  { key: 'clients', label: 'Clients', description: 'Gestion des clients' },
  { key: 'statistiques', label: 'Statistiques', description: 'Rapports et analyses' },
  { key: 'utilisateurs', label: 'Utilisateurs', description: 'Liste des utilisateurs' },
  { key: 'parametres', label: 'Paramètres', description: 'Configuration de l\'hôtel' },
];

const ROLES: { key: UserRole; label: string }[] = [
  { key: 'manager', label: 'Gérant' },
  { key: 'receptionist', label: 'Réceptionniste' },
];

type PermissionsState = Record<UserRole, Record<string, boolean>>;

export function PermissionsManagement() {
  const { user, role: currentUserRole } = useAuth();
  const [permissions, setPermissions] = useState<PermissionsState>({
    owner: {},
    manager: {},
    receptionist: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hotelId, setHotelId] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      // Get current user's hotel_id
      const { data: profileData } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', user?.id)
        .maybeSingle();

      if (!profileData?.hotel_id) {
        setIsLoading(false);
        return;
      }

      setHotelId(profileData.hotel_id);

      // Get existing permissions
      const { data: permData, error } = await supabase
        .from('role_permissions')
        .select('role, page_key, can_access')
        .eq('hotel_id', profileData.hotel_id);

      if (error) throw error;

      // Initialize with defaults (all true for manager, basic for receptionist)
      const newPermissions: PermissionsState = {
        owner: {},
        manager: {},
        receptionist: {},
      };

      // Set defaults
      PAGES.forEach((page) => {
        newPermissions.owner[page.key] = true; // Owner always has access
        newPermissions.manager[page.key] = true; // Manager default: all access
        newPermissions.receptionist[page.key] = ['dashboard', 'chambres', 'reservations', 'clients'].includes(page.key);
      });

      // Override with saved permissions
      permData?.forEach((perm) => {
        if (perm.role in newPermissions) {
          newPermissions[perm.role as UserRole][perm.page_key] = perm.can_access;
        }
      });

      setPermissions(newPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Erreur lors du chargement des permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (role: UserRole, pageKey: string, checked: boolean) => {
    if (role === 'owner') return; // Owner permissions can't be changed

    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [pageKey]: checked,
      },
    }));
  };

  const handleSave = async () => {
    if (!hotelId) {
      toast.error('Aucun hôtel associé');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare upsert data for manager and receptionist only
      const upsertData: Array<{
        hotel_id: string;
        role: string;
        page_key: string;
        can_access: boolean;
      }> = [];

      ROLES.forEach((role) => {
        PAGES.forEach((page) => {
          upsertData.push({
            hotel_id: hotelId,
            role: role.key,
            page_key: page.key,
            can_access: permissions[role.key][page.key] ?? true,
          });
        });
      });

      // Delete existing and insert new
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('hotel_id', hotelId)
        .in('role', ['manager', 'receptionist']);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(upsertData);

      if (insertError) throw insertError;

      toast.success('Permissions enregistrées');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (currentUserRole !== 'owner') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Seuls les propriétaires peuvent gérer les permissions.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Permissions par rôle</h3>
          <p className="text-sm text-muted-foreground">
            Définissez quelles pages chaque rôle peut accéder
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Page</th>
              {ROLES.map((role) => (
                <th key={role.key} className="text-center px-4 py-3 text-sm font-medium text-foreground">
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PAGES.map((page) => (
              <tr key={page.key} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{page.label}</p>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                </td>
                {ROLES.map((role) => (
                  <td key={role.key} className="text-center px-4 py-3">
                    <Checkbox
                      checked={permissions[role.key][page.key] ?? true}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(role.key, page.key, checked as boolean)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: Les propriétaires ont toujours accès à toutes les pages.
      </p>
    </div>
  );
}
