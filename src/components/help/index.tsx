// ============================================
// 🆘 COMPOSANTS D'AIDE - HOTELMANAGER
// Version FRANÇAIS uniquement
// ============================================

import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { helpContent } from './HelpContent';

// ============================================
// 1. HELP TOOLTIP - Infobulle (?)
// ============================================

interface HelpTooltipProps {
  text: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  text, 
  side = 'top',
  className = ''
}) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors ${className}`}
            type="button"
            aria-label="Aide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs bg-primary text-primary-foreground border-primary"
        >
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// 2. HELP BUTTON - Bouton d'aide flottant
// ============================================

interface HelpButtonProps {
  onClick: () => void;
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  onClick,
  className = ''
}) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed top-20 right-4 z-40 rounded-full shadow-lg hover:shadow-xl transition-all ${className}`}
      size="lg"
      variant="default"
    >
      <HelpCircle className="w-5 h-5 mr-2" />
      Aide
    </Button>
  );
};

// ============================================
// 3. HELP PANEL - Panneau latéral d'aide
// ============================================

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ 
  isOpen, 
  onClose, 
  pageId 
}) => {
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const content = helpContent[pageId as keyof typeof helpContent];

  if (!content) {
    console.warn(`Help content for page "${pageId}" not found`);
    return null;
  }

  const toggleSection = (index: number) => {
    setOpenSections(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md overflow-y-auto"
      >
        {/* HEADER */}
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="w-6 h-6 text-primary" />
            {content.title}
          </SheetTitle>
        </SheetHeader>

        {/* DESCRIPTION */}
        <div className="mt-4 mb-6">
          <p className="text-muted-foreground leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* SECTIONS */}
        <div className="space-y-3">
          {content.sections.map((section, index) => (
            <div 
              key={index}
              className="border border-border rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
              >
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">{section.icon}</span>
                  {section.title}
                </h3>
                {openSections.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Section Content */}
              {openSections.includes(index) && (
                <div className="p-4 bg-background">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="mb-4 last:mb-0">
                      {/* Sous-titre */}
                      {item.subtitle && (
                        <h4 className="font-medium text-foreground mb-2">
                          {item.subtitle}
                        </h4>
                      )}

                      {/* Texte */}
                      {item.text && (
                        <p className="text-muted-foreground mb-2 leading-relaxed">
                          {item.text}
                        </p>
                      )}

                      {/* Liste d'étapes */}
                      {item.steps && item.steps.length > 0 && (
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                          {item.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ol>
                      )}

                      {/* Liste à puces */}
                      {item.bullets && item.bullets.length > 0 && (
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          {item.bullets.map((bullet, bulletIndex) => (
                            <li key={bulletIndex} className="text-muted-foreground">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Note/Astuce */}
                      {item.note && (
                        <div className="mt-2 p-3 bg-primary/10 border-l-4 border-primary rounded">
                          <p className="text-sm text-foreground">
                            💡 <strong>Astuce :</strong> {item.note}
                          </p>
                        </div>
                      )}

                      {/* Warning */}
                      {item.warning && (
                        <div className="mt-2 p-3 bg-orange-500/10 border-l-4 border-orange-500 rounded">
                          <p className="text-sm text-foreground">
                            ⚠️ <strong>Attention :</strong> {item.warning}
                          </p>
                        </div>
                      )}

                      {/* Image/Screenshot */}
                      {item.image && (
                        <div className="mt-3">
                          <img 
                            src={item.image} 
                            alt={item.imageAlt || 'Illustration'}
                            className="rounded border border-border w-full"
                          />
                          {item.imageAlt && (
                            <p className="text-xs text-muted-foreground mt-1 text-center">
                              {item.imageAlt}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER - Bouton fermer */}
        <div className="mt-6 pt-4 border-t">
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Fermer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================
// 4. QUICK TIP - Astuces rapides
// ============================================

interface QuickTipProps {
  type?: 'info' | 'warning' | 'success' | 'tip';
  children: React.ReactNode;
}

export const QuickTip: React.FC<QuickTipProps> = ({ 
  type = 'info',
  children 
}) => {
  const styles = {
    info: 'bg-primary/10 border-primary text-foreground',
    warning: 'bg-orange-500/10 border-orange-500 text-foreground',
    success: 'bg-green-500/10 border-green-500 text-foreground',
    tip: 'bg-purple-500/10 border-purple-500 text-foreground'
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    tip: '💡'
  };

  return (
    <div className={`p-3 border-l-4 rounded ${styles[type]}`}>
      <p className="text-sm">
        {icons[type]} {children}
      </p>
    </div>
  );
};

export default {
  HelpTooltip,
  HelpButton,
  HelpPanel,
  QuickTip
};
