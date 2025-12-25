import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BedDouble, 
  CalendarCheck, 
  Users, 
  UserCog,
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Hotel,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['owner', 'manager', 'receptionist'] as UserRole[] },
  { path: '/chambres', label: 'Chambres', icon: BedDouble, roles: ['owner', 'manager', 'receptionist'] as UserRole[] },
  { path: '/reservations', label: 'Réservations', icon: CalendarCheck, roles: ['owner', 'manager', 'receptionist'] as UserRole[] },
  { path: '/clients', label: 'Clients', icon: Users, roles: ['owner', 'manager', 'receptionist'] as UserRole[] },
  { path: '/utilisateurs', label: 'Utilisateurs', icon: UserCog, roles: ['owner', 'manager'] as UserRole[] },
  { path: '/statistiques', label: 'Statistiques', icon: BarChart3, roles: ['owner', 'manager'] as UserRole[] },
  { path: '/parametres', label: 'Paramètres', icon: Settings, roles: ['owner', 'manager'] as UserRole[] },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, hasRole, logout } = useAuth();

  // Show all items if no role (new user) or filter by role
  const visibleNavItems = navItems.filter(item => 
    !role || hasRole(item.roles)
  );

  const initials = profile?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const roleLabels: Record<UserRole, string> = {
    owner: 'Propriétaire',
    manager: 'Gérant',
    receptionist: 'Réceptionniste',
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar z-50 transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-accent">
          <Hotel className="w-5 h-5 text-sidebar-primary" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-base font-semibold text-sidebar-primary">HotelManager</h1>
            <p className="text-xs text-sidebar-muted">Gestion hôtelière</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item",
                isActive && "nav-item-active"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* User Menu Section */}
      {profile && user && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors",
                  collapsed && "justify-center"
                )}
              >
                <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium text-sidebar-primary flex-shrink-0">
                  {initials}
                </div>
                {!collapsed && (
                  <div className="animate-fade-in min-w-0 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.name}</p>
                    {role && <p className="text-xs text-sidebar-muted">{roleLabels[role]}</p>}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56" 
              align={collapsed ? "center" : "start"} 
              side="top"
              sideOffset={8}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium leading-none">{profile.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  {role && (
                    <Badge variant="secondary" className="w-fit">
                      {roleLabels[role]}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/parametres')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
}
