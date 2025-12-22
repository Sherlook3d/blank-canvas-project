import { useState } from 'react';
import { Search, Settings, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { users, formatDate, getRoleLabel } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/hotel';

type FilterRole = 'all' | UserRole | 'none';

const roleFilters: { value: FilterRole; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'none', label: 'Sans rôle' },
  { value: 'owner', label: 'Propriétaires' },
  { value: 'manager', label: 'Gérants' },
  { value: 'receptionist', label: 'Réceptionnistes' },
];

const Utilisateurs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterRole>('all');

  const usersWithRoles = users.filter(u => u.role);
  
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'none' ? !user.role : user.role === activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Gestion des utilisateurs"
        subtitle={`${users.length} utilisateurs • ${usersWithRoles.length} avec rôle`}
      />

      {/* Search and Filters */}
      <div className="gravity-card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {roleFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'filter-pill',
                  activeFilter === filter.value && 'filter-pill-active'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="gravity-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gravity-table">
            <thead className="bg-muted/30">
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Date d'inscription</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={user.role} />
                  </td>
                  <td>
                    <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                  </td>
                  <td className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Modifier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium text-foreground mb-1">Aucun utilisateur trouvé</h3>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos filtres
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Utilisateurs;
