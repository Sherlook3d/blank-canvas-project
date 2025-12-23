import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string | null;
  hotel_id: string | null;
}

type UserRole = 'owner' | 'manager' | 'receptionist';

const roleLabels: Record<UserRole, string> = {
  owner: 'Propriétaire',
  manager: 'Gérant',
  receptionist: 'Réceptionniste',
};

const roleBadgeVariants: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  manager: 'secondary',
  receptionist: 'outline',
};

export function UserManagement() {
  const { user, role: currentUserRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'receptionist' as UserRole,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // First get the current user's hotel_id
      const { data: profileData } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', user?.id)
        .maybeSingle();

      if (!profileData?.hotel_id) {
        setUsers([]);
        return;
      }

      // Get all profiles for this hotel
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, status, hotel_id')
        .eq('hotel_id', profileData.hotel_id);

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: '', // Email is not stored in profiles
          status: profile.status,
          role: userRole?.role || null,
          hotel_id: profile.hotel_id,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (userToEdit?: UserWithRole) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        email: userToEdit.email,
        password: '',
        name: userToEdit.name,
        role: (userToEdit.role as UserRole) || 'receptionist',
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'receptionist',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        // Update existing user's profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name: formData.name })
          .eq('id', editingUser.id);

        if (profileError) throw profileError;

        // Update or insert role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', editingUser.id)
          .maybeSingle();

        if (existingRole) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: formData.role })
            .eq('user_id', editingUser.id);
          if (roleError) throw roleError;
        } else {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: editingUser.id, role: formData.role });
          if (roleError) throw roleError;
        }

        toast.success('Utilisateur mis à jour');
      } else {
        // For creating new users, we need to use Supabase Auth admin functions
        // This would typically be done via an edge function
        toast.info('La création d\'utilisateurs nécessite une configuration admin supplémentaire');
      }

      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userToDelete: UserWithRole) => {
    if (userToDelete.id === user?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir retirer ${userToDelete.name} de l'hôtel ?`)) {
      return;
    }

    try {
      // Remove the user's role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userToDelete.id);

      if (roleError) throw roleError;

      // Remove hotel_id from profile (user still exists but no longer part of hotel)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ hotel_id: null })
        .eq('id', userToDelete.id);

      if (profileError) throw profileError;

      toast.success('Utilisateur retiré de l\'hôtel');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (currentUserRole !== 'owner') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Seuls les propriétaires peuvent gérer les utilisateurs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Gestion des utilisateurs</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les utilisateurs et leurs rôles
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucun utilisateur trouvé
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>
                  {u.role ? (
                    <Badge variant={roleBadgeVariants[u.role as UserRole] || 'outline'}>
                      {roleLabels[u.role as UserRole] || u.role}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Non défini</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>
                    {u.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(u)}
                      disabled={u.id === user?.id}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(u)}
                      disabled={u.id === user?.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom complet"
              />
            </div>

            {!editingUser && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mot de passe</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Réceptionniste</SelectItem>
                  <SelectItem value="manager">Gérant</SelectItem>
                  <SelectItem value="owner">Propriétaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingUser ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
