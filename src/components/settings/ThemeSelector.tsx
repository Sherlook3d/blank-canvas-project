import { Check } from 'lucide-react';
import { useTheme, themeConfigs, ThemeType } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes: ThemeType[] = ['midnight-dark', 'soft-light', 'apple-gray', 'ocean-blue', 'nature-green'];

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
                "relative p-4 rounded-xl border-2 transition-all duration-300 text-left group",
                "hover:scale-[1.02] hover:shadow-xl",
                isActive
                  ? "border-accent ring-2 ring-accent/30 shadow-lg"
                  : "border-border hover:border-accent/50"
              )}
              style={{
                background: `linear-gradient(135deg, hsl(${config.background}), hsl(${config.card}))`,
              }}
            >
              {isActive && (
                <Badge 
                  className="absolute top-3 right-3 gap-1"
                  style={{
                    background: `linear-gradient(135deg, hsl(${config.gradientFrom}), hsl(${config.gradientTo}))`,
                    color: 'white',
                  }}
                >
                  <Check className="w-3 h-3" />
                  Actif
                </Badge>
              )}

              {/* Theme Preview */}
              <div 
                className="h-28 rounded-lg mb-3 overflow-hidden border"
                style={{ 
                  backgroundColor: `hsl(${config.background})`,
                  borderColor: `hsl(${config.border} / 0.5)`,
                }}
              >
                <div className="flex h-full">
                  {/* Sidebar preview */}
                  <div 
                    className="w-1/4 h-full p-2"
                    style={{ backgroundColor: `hsl(${config.sidebar})` }}
                  >
                    {/* Active menu item */}
                    <div 
                      className="w-full h-3 rounded mb-2"
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${config.gradientFrom} / 0.3), hsl(${config.gradientTo} / 0.3))`,
                        borderLeft: `2px solid hsl(${config.accent})`,
                      }}
                    />
                    {/* Menu items */}
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="w-3/4 h-1.5 rounded mb-1.5"
                        style={{ backgroundColor: `hsl(${config.mutedForeground} / 0.3)` }}
                      />
                    ))}
                  </div>
                  
                  {/* Content preview */}
                  <div className="flex-1 p-2">
                    {/* KPI cards row */}
                    <div className="flex gap-1.5 mb-2">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i}
                          className="flex-1 h-8 rounded"
                          style={{ 
                            backgroundColor: `hsl(${config.card})`,
                            boxShadow: config.neumorphism 
                              ? '-2px -2px 4px rgba(255,255,255,0.6), 2px 2px 4px rgba(163,177,198,0.2)'
                              : '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        >
                          <div 
                            className="w-2/3 h-1.5 rounded m-1.5"
                            style={{ backgroundColor: `hsl(${config.mutedForeground} / 0.4)` }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Main card */}
                    <div 
                      className="h-10 rounded"
                      style={{ 
                        backgroundColor: `hsl(${config.card})`,
                        boxShadow: config.neumorphism 
                          ? '-3px -3px 6px rgba(255,255,255,0.6), 3px 3px 6px rgba(163,177,198,0.2)'
                          : '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      {/* Gradient button preview */}
                      <div 
                        className="w-1/3 h-2 rounded m-2"
                        style={{ 
                          background: `linear-gradient(135deg, hsl(${config.gradientFrom}), hsl(${config.gradientTo}))`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Info */}
              <div className="mb-3">
                <h4 
                  className="font-semibold text-base"
                  style={{ color: `hsl(${config.foreground})` }}
                >
                  {config.name}
                </h4>
                <p 
                  className="text-xs"
                  style={{ color: `hsl(${config.mutedForeground})` }}
                >
                  {config.description}
                </p>
              </div>

              {/* Color Palette Preview */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {/* Background */}
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white/20 shadow-sm"
                    style={{ backgroundColor: `hsl(${config.background})` }}
                    title="Arrière-plan"
                  />
                  {/* Sidebar */}
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white/20 shadow-sm"
                    style={{ backgroundColor: `hsl(${config.sidebar})` }}
                    title="Menu"
                  />
                  {/* Card */}
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white/20 shadow-sm"
                    style={{ backgroundColor: `hsl(${config.card})` }}
                    title="Cartes"
                  />
                </div>
                
                {/* Gradient accent preview */}
                <div 
                  className="flex-1 h-2 rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, hsl(${config.gradientFrom}), hsl(${config.gradientTo}))`,
                  }}
                  title="Accent"
                />
              </div>

              {/* Hover effect overlay */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                  "group-hover:opacity-100"
                )}
                style={{
                  background: `linear-gradient(135deg, hsl(${config.gradientFrom} / 0.05), hsl(${config.gradientTo} / 0.05))`,
                  pointerEvents: 'none',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
