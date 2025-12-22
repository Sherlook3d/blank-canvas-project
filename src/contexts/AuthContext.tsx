import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/hotel';
import { users as mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'hotelmanager_auth';

// Demo passwords (in real app, this would be server-side)
const demoPasswords: Record<string, string> = {
  'owner@hotelmanager.com': 'owner123',
  'manager@hotelmanager.com': 'manager123',
  'reception@hotelmanager.com': 'reception123',
};

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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    if (foundUser.status !== 'active') {
      return { success: false, error: 'Compte désactivé' };
    }

    const expectedPassword = demoPasswords[foundUser.email];
    if (password !== expectedPassword) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    setUser(foundUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: foundUser.id }));
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return { success: false, error: 'Cet email est déjà utilisé' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
    }

    // In demo mode, create a new receptionist user
    const newUser: User = {
      id: `user-${Date.now()}`,
      hotelId: 'hotel-1',
      name,
      email,
      role: 'receptionist',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    demoPasswords[email] = password;
    
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: newUser.id }));
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
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, hasRole }}>
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
