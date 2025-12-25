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
    // Dark Blue Dashboard (image 6)
    background: '222 41% 12%',
    sidebar: '225 43% 8%',
    card: '222 38% 16%',
    foreground: '210 40% 98%',
    mutedForeground: '215 20% 55%',
    accent: '160 84% 39%',
    name: 'Bleu Nuit',
    description: 'Dashboard sombre et professionnel',
  },
  'light-gray': {
    // Apple-inspired light theme - sidebar plus sombre
    background: '220 14% 96%',
    sidebar: '220 15% 78%',
    card: '0 0% 100%',
    foreground: '222 47% 11%',
    mutedForeground: '215 16% 42%',
    accent: '215 100% 50%',
    name: 'Neumorphisme',
    description: 'Thème clair style Apple',
  },
  'blue': {
    // Dark Teal Dashboard (image 7)
    background: '200 50% 12%',
    sidebar: '200 60% 8%',
    card: '200 45% 18%',
    foreground: '180 20% 95%',
    mutedForeground: '190 15% 60%',
    accent: '190 80% 50%',
    name: 'Bleu Océan',
    description: 'Dashboard bleu-vert moderne',
  },
  'green': {
    // Pink/Rose Gradient (image 5)
    background: '320 40% 96%',
    sidebar: '330 60% 95%',
    card: '0 0% 100%',
    foreground: '320 50% 20%',
    mutedForeground: '320 20% 50%',
    accent: '330 80% 60%',
    name: 'Rose Doux',
    description: 'Thème rose clair et élégant',
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
    if (themeName === 'light-gray' || themeName === 'green') {
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
