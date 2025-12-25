import { Check } from 'lucide-react';
import { useTheme, themeConfigs, ThemeType } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes: ThemeType[] = ['dark-gray', 'light-gray', 'blue', 'green'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Choisir un thème</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Personnalisez l'apparence de votre application
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themes.map((themeName) => {
          const config = themeConfigs[themeName];
          const isActive = theme === themeName;

          return (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-300 text-left",
                "hover:scale-[1.02] hover:shadow-lg",
                isActive
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-border hover:border-accent/50"
              )}
            >
              {isActive && (
                <Badge 
                  className="absolute top-3 right-3 bg-accent text-accent-foreground gap-1"
                >
                  <Check className="w-3 h-3" />
                  Actif
                </Badge>
              )}

              {/* Theme Preview */}
              <div 
                className="h-24 rounded-lg mb-3 overflow-hidden border border-border/50"
                style={{ 
                  backgroundColor: `hsl(${config.background})`,
                }}
              >
                <div className="flex h-full">
                  {/* Sidebar preview */}
                  <div 
                    className="w-1/4 h-full p-2"
                    style={{ backgroundColor: `hsl(${config.sidebar})` }}
                  >
                    <div 
                      className="w-full h-2 rounded mb-1.5"
                      style={{ backgroundColor: `hsl(${config.accent})` }}
                    />
                    <div 
                      className="w-3/4 h-1.5 rounded mb-1"
                      style={{ backgroundColor: `hsl(${config.mutedForeground} / 0.3)` }}
                    />
                    <div 
                      className="w-2/3 h-1.5 rounded"
                      style={{ backgroundColor: `hsl(${config.mutedForeground} / 0.3)` }}
                    />
                  </div>
                  
                  {/* Content preview */}
                  <div className="flex-1 p-2">
                    <div className="flex gap-1.5 mb-2">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i}
                          className="flex-1 h-6 rounded"
                          style={{ backgroundColor: `hsl(${config.card})` }}
                        />
                      ))}
                    </div>
                    <div 
                      className="h-8 rounded"
                      style={{ backgroundColor: `hsl(${config.card})` }}
                    />
                  </div>
                </div>
              </div>

              {/* Theme Info */}
              <div>
                <h4 className="font-medium text-foreground">{config.name}</h4>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>

              {/* Color Palette Preview */}
              <div className="flex gap-1.5 mt-3">
                <div 
                  className="w-5 h-5 rounded-full border border-border/50"
                  style={{ backgroundColor: `hsl(${config.background})` }}
                  title="Arrière-plan"
                />
                <div 
                  className="w-5 h-5 rounded-full border border-border/50"
                  style={{ backgroundColor: `hsl(${config.sidebar})` }}
                  title="Menu"
                />
                <div 
                  className="w-5 h-5 rounded-full border border-border/50"
                  style={{ backgroundColor: `hsl(${config.card})` }}
                  title="Cartes"
                />
                <div 
                  className="w-5 h-5 rounded-full border border-border/50"
                  style={{ backgroundColor: `hsl(${config.accent})` }}
                  title="Accent"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
