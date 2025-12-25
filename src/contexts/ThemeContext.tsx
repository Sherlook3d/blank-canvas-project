import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type ThemeType = 'midnight-dark' | 'soft-light' | 'ocean-blue' | 'nature-green' | 'apple-gray';

interface ThemeColors {
  // Core colors
  background: string;
  sidebar: string;
  card: string;
  foreground: string;
  mutedForeground: string;
  disabledForeground: string;
  border: string;
  
  // Accent & buttons
  accent: string;
  accentHover: string;
  gradientFrom: string;
  gradientTo: string;
  
  // Status badges
  badgeAvailable: string;
  badgeOccupied: string;
  badgeMaintenance: string;
  
  // Card effects
  cardShadow: string;
  cardBorder: string;
  glassEffect: boolean;
  neumorphism: boolean;
  
  // Meta
  name: string;
  description: string;
  isDark: boolean;
}

export const themeConfigs: Record<ThemeType, ThemeColors> = {
  'midnight-dark': {
    // Inspired by AIZCRM dark dashboard
    background: '210 29% 6%', // #0f1419
    sidebar: '222 41% 12%', // #1a1f2e
    card: '222 38% 16%', // #252d3d
    foreground: '0 0% 100%', // #ffffff
    mutedForeground: '215 20% 60%', // #94a3b8
    disabledForeground: '215 16% 47%', // #64748b
    border: '220 17% 26%', // #313948
    
    accent: '173 80% 40%', // turquoise
    accentHover: '173 80% 34%', // #0891b2
    gradientFrom: '186 94% 41%', // #06b6d4 cyan
    gradientTo: '160 84% 39%', // #10b981 green
    
    badgeAvailable: '160 84% 39%', // #10b981
    badgeOccupied: '38 95% 64%', // #f59e0b
    badgeMaintenance: '215 16% 47%', // #64748b
    
    cardShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    cardBorder: '222 30% 22%', // #2d3748
    glassEffect: true,
    neumorphism: false,
    
    name: 'Midnight Dark',
    description: 'Thème sombre professionnel',
    isDark: true,
  },
  'soft-light': {
    // Improved contrast light theme
    background: '220 20% 96%', // #f3f5f9
    sidebar: '230 25% 92%', // Slightly darker sidebar
    card: '0 0% 100%', // #ffffff
    foreground: '222 47% 11%', // #1e293b - darker text
    mutedForeground: '215 25% 40%', // Darker muted text
    disabledForeground: '215 20% 55%', 
    border: '220 15% 80%', // Slightly darker borders
    
    accent: '263 70% 50%', // Darker purple/lavender
    accentHover: '263 70% 42%', 
    gradientFrom: '263 70% 50%', // #7c3aed darker lavender
    gradientTo: '239 84% 55%', // #5457cd darker violet
    
    badgeAvailable: '160 84% 35%', // Slightly darker green
    badgeOccupied: '38 92% 50%', // Darker orange
    badgeMaintenance: '215 20% 50%', 
    
    cardShadow: '-6px -6px 12px rgba(255, 255, 255, 0.9), 6px 6px 12px rgba(140, 150, 175, 0.25)',
    cardBorder: '220 15% 85%', 
    glassEffect: false,
    neumorphism: true,
    
    name: 'Soft Light',
    description: 'Thème clair neumorphique',
    isDark: false,
  },
  'ocean-blue': {
    // Modern blue dashboard
    background: '209 62% 13%', // #0c1e35
    sidebar: '209 50% 23%', // #1e3a5f
    card: '209 50% 23%', // semi-transparent version
    foreground: '204 100% 97%', // #f0f9ff
    mutedForeground: '199 92% 84%', // #bae6fd
    disabledForeground: '199 92% 69%', // #7dd3fc
    border: '209 45% 33%', // #2d4f7c
    
    accent: '199 89% 48%', // #0ea5e9
    accentHover: '200 98% 39%', // #0284c7
    gradientFrom: '199 89% 48%', // #0ea5e9 blue
    gradientTo: '186 94% 41%', // #06b6d4 cyan
    
    badgeAvailable: '183 90% 48%', // #22d3ee
    badgeOccupied: '27 96% 61%', // #fb923c
    badgeMaintenance: '215 16% 47%', // #64748b
    
    cardShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    cardBorder: '199 92% 60%', // rgba(56, 189, 248, 0.2)
    glassEffect: true,
    neumorphism: false,
    
    name: 'Ocean Blue',
    description: 'Thème bleu océan moderne',
    isDark: true,
  },
  'nature-green': {
    // Inspired by Staking dark green dashboard
    background: '160 52% 8%', // #0a1f1a
    sidebar: '160 52% 11%', // #0d2b24
    card: '162 53% 14%', // #0f3830
    foreground: '138 76% 97%', // #f0fdf4
    mutedForeground: '142 77% 85%', // #bbf7d0
    disabledForeground: '142 77% 73%', // #86efac
    border: '161 50% 22%', // #1a5245
    
    accent: '82 84% 44%', // lime #84cc16
    accentHover: '84 81% 36%', // #65a30d
    gradientFrom: '82 84% 44%', // #84cc16 lime
    gradientTo: '142 71% 45%', // #22c55e green
    
    badgeAvailable: '82 84% 44%', // #84cc16
    badgeOccupied: '27 96% 61%', // #fb923c
    badgeMaintenance: '215 25% 35%', // #475569
    
    cardShadow: '0 0 20px rgba(132, 204, 22, 0.15)',
    cardBorder: '82 84% 44%', // lime with opacity
    glassEffect: true,
    neumorphism: false,
    
    name: 'Nature Green',
    description: 'Thème vert nature',
    isDark: true,
  },
  'apple-gray': {
    // Apple-inspired gray theme with visible cards
    background: '220 13% 82%', // #c9cdd4 - medium gray background
    sidebar: '220 15% 88%', // #dde0e5 - lighter sidebar
    card: '0 0% 100%', // #ffffff - pure white cards for contrast
    foreground: '220 15% 15%', // #232629 - very dark text
    mutedForeground: '220 10% 40%', // #5c6370 - darker muted
    disabledForeground: '220 10% 55%', 
    border: '220 12% 70%', // Visible borders
    
    accent: '211 100% 50%', // Apple blue #007AFF
    accentHover: '211 100% 42%', // Darker blue on hover
    gradientFrom: '211 100% 50%', // Apple blue
    gradientTo: '199 100% 48%', // Lighter blue
    
    badgeAvailable: '142 70% 42%', // Apple green
    badgeOccupied: '32 95% 55%', // Apple orange
    badgeMaintenance: '220 10% 50%', 
    
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06)',
    cardBorder: '220 12% 75%', 
    glassEffect: false,
    neumorphism: false,
    
    name: 'Apple Gray',
    description: 'Thème gris style Apple',
    isDark: false,
  },
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>('midnight-dark');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Apply theme to CSS variables
  const applyTheme = (themeName: ThemeType) => {
    const root = document.documentElement;
    const colors = themeConfigs[themeName];
    
    // Core colors
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--card-foreground', colors.foreground);
    root.style.setProperty('--popover', colors.card);
    root.style.setProperty('--popover-foreground', colors.foreground);
    root.style.setProperty('--muted-foreground', colors.mutedForeground);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--input', colors.border);
    
    // Accent colors
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', '0 0% 100%');
    root.style.setProperty('--accent-hover', colors.accentHover);
    root.style.setProperty('--gradient-from', colors.gradientFrom);
    root.style.setProperty('--gradient-to', colors.gradientTo);
    
    // Primary based on theme
    if (colors.isDark) {
      root.style.setProperty('--primary', '0 0% 100%');
      root.style.setProperty('--primary-foreground', colors.background);
    } else {
      root.style.setProperty('--primary', colors.accent);
      root.style.setProperty('--primary-foreground', '0 0% 100%');
    }
    
    // Secondary
    root.style.setProperty('--secondary', colors.card);
    root.style.setProperty('--secondary-foreground', colors.foreground);
    
    // Muted
    root.style.setProperty('--muted', colors.card);
    
    // Status badges
    root.style.setProperty('--badge-available', colors.badgeAvailable);
    root.style.setProperty('--badge-occupied', colors.badgeOccupied);
    root.style.setProperty('--badge-maintenance', colors.badgeMaintenance);
    
    // Sidebar
    root.style.setProperty('--sidebar-background', colors.sidebar);
    root.style.setProperty('--sidebar-foreground', colors.foreground);
    root.style.setProperty('--sidebar-accent', colors.accent);
    root.style.setProperty('--sidebar-border', colors.border);
    root.style.setProperty('--sidebar-muted', colors.mutedForeground);
    
    // Card effects
    root.style.setProperty('--card-shadow', colors.cardShadow);
    root.style.setProperty('--card-border', colors.cardBorder);
    root.style.setProperty('--glass-effect', colors.glassEffect ? '1' : '0');
    root.style.setProperty('--neumorphism', colors.neumorphism ? '1' : '0');
    
    // Set dark/light class
    if (colors.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
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

        // Map old theme names to new ones
        const themeMap: Record<string, ThemeType> = {
          'dark-gray': 'midnight-dark',
          'light-gray': 'soft-light',
          'blue': 'ocean-blue',
          'green': 'nature-green',
        };
        
        const savedTheme = data?.theme as string;
        const mappedTheme = themeMap[savedTheme] || savedTheme as ThemeType;
        const validTheme = Object.keys(themeConfigs).includes(mappedTheme) 
          ? mappedTheme 
          : 'midnight-dark';
        
        setThemeState(validTheme);
        applyTheme(validTheme);
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
          title: `Thème ${themeConfigs[newTheme].name} appliqué ✓`,
          description: themeConfigs[newTheme].description,
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
