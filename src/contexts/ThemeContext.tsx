import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type ThemeType = 'dark-gray' | 'light-gray' | 'blue' | 'green';

interface ThemeColors {
  background: string;
  sidebar: string;
  card: string;
  foreground: string;
  mutedForeground: string;
  accent: string;
  name: string;
  description: string;
}

export const themeConfigs: Record<ThemeType, ThemeColors> = {
  'dark-gray': {
    background: '222 30% 14%',
    sidebar: '220 25% 7%',
    card: '222 25% 18%',
    foreground: '220 14% 92%',
    mutedForeground: '217 10% 64%',
    accent: '244 55% 52%',
    name: 'Gris Foncé',
    description: 'Thème sombre moderne et élégant',
  },
  'light-gray': {
    background: '220 14% 96%',
    sidebar: '0 0% 100%',
    card: '0 0% 100%',
    foreground: '222 47% 11%',
    mutedForeground: '215 16% 47%',
    accent: '217 91% 60%',
    name: 'Gris Clair',
    description: 'Thème clair et épuré',
  },
  'blue': {
    background: '222 47% 11%',
    sidebar: '217 33% 17%',
    card: '213 50% 23%',
    foreground: '210 40% 98%',
    mutedForeground: '215 25% 65%',
    accent: '213 94% 68%',
    name: 'Bleu',
    description: 'Thème bleu professionnel',
  },
  'green': {
    background: '160 84% 17%',
    sidebar: '166 76% 9%',
    card: '160 82% 20%',
    foreground: '138 76% 97%',
    mutedForeground: '142 72% 83%',
    accent: '160 72% 51%',
    name: 'Vert',
    description: 'Thème vert naturel',
  },
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>('light-gray');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Apply theme to CSS variables
  const applyTheme = (themeName: ThemeType) => {
    const root = document.documentElement;
    const colors = themeConfigs[themeName];
    
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--card-foreground', colors.foreground);
    root.style.setProperty('--popover', colors.card);
    root.style.setProperty('--popover-foreground', colors.foreground);
    root.style.setProperty('--muted-foreground', colors.mutedForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--sidebar-background', colors.sidebar);
    root.style.setProperty('--sidebar-foreground', colors.foreground);
    
    // Set dark/light class for proper styling
    if (themeName === 'light-gray') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  };

  // Load theme from Supabase on mount
  useEffect(() => {
    const loadTheme = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        const savedTheme = (data?.theme as ThemeType) || 'light-gray';
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user]);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Thème appliqué avec succès",
          description: `Le thème ${themeConfigs[newTheme].name} a été activé`,
        });
      } catch (error) {
        console.error('Error saving theme:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder le thème",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
