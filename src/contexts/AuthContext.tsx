import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/hotel';
import { users as mockUsers, userPasswords } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'hotelmanager_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const foundUser = mockUsers.find(u => u.id === parsed.userId);
        if (foundUser && foundUser.status === 'active') {
          setUser(foundUser);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const foundUser = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    if (foundUser.status !== 'active') {
      return { success: false, error: 'Compte désactivé' };
    }

    const expectedPassword = userPasswords[foundUser.username];
    if (password !== expectedPassword) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    setUser(foundUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: foundUser.id }));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
