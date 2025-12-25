import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LigneType, getIconType, formatMontant, CompteClient, useComptes } from '@/hooks/useComptes';
import { cn } from '@/lib/utils';
import { Delete, Check } from 'lucide-react';

const TYPES: LigneType[] = ['Restaurant', 'Minibar', 'Blanchisserie', 'Parking', 'Spa', 'Téléphone', 'Autre'];

interface AjouterConsommationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Either provide compte or onConfirm + clientName + chambreNum
  compte?: CompteClient | null;
  onConfirm?: (type: LigneType, montant: number, description?: string) => Promise<boolean>;
  clientName?: string;
  chambreNum?: string;
}

export function AjouterConsommationDialog({
  open,
  onOpenChange,
  compte,
  onConfirm,
  clientName,
  chambreNum
}: AjouterConsommationDialogProps) {
  const { ajouterConsommation, refreshComptes } = useComptes();
  const [selectedType, setSelectedType] = useState<LigneType>('Restaurant');
  const [montant, setMontant] = useState('0');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive client name and room from compte if available
  const displayClientName = clientName || (compte?.client ? `${compte.client.first_name} ${compte.client.last_name}` : undefined);
  const displayChambreNum = chambreNum || compte?.reservation?.room?.number;

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      setMontant('0');
    } else if (key === 'DEL') {
      setMontant(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setMontant(prev => prev === '0' ? key : prev + key);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setMontant(prev => {
      const current = parseInt(prev) || 0;
      return (current + amount).toString();
    });
  };

  const handleSubmit = async () => {
    const numMontant = parseFloat(montant);
    if (numMontant <= 0) return;

    setIsSubmitting(true);
    
    let success = false;
    if (compte) {
      // Use compte directly
      success = await ajouterConsommation(compte.id, selectedType, numMontant, description || undefined);
      if (success) {
        refreshComptes();
      }
    } else if (onConfirm) {
      // Use callback
      success = await onConfirm(selectedType, numMontant, description || undefined);
    }
    
    setIsSubmitting(false);

    if (success) {
      setMontant('0');
      setDescription('');
      setSelectedType('Restaurant');
      onOpenChange(false);
    }
  };

  const resetAndClose = () => {
    setMontant('0');
    setDescription('');
    setSelectedType('Restaurant');
    onOpenChange(false);
  };

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setMontant('0');
      setDescription('');
      setSelectedType('Restaurant');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ➕ Ajouter consommation
            {displayChambreNum && <span className="text-sm font-normal text-muted-foreground">• Ch. {displayChambreNum}</span>}
          </DialogTitle>
          {displayClientName && (
            <p className="text-sm text-muted-foreground">{displayClientName}</p>
          )}
        </DialogHeader>

        {/* Type Selector */}
        <div className="space-y-2">
          <Label>Type de consommation</Label>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                  selectedType === type
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border hover:border-accent/50 hover:bg-muted'
                )}
              >
                <span className="text-xl">{getIconType(type)}</span>
                <span className="text-xs font-medium">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Montant Display */}
        <div className="space-y-2">
          <Label>Montant</Label>
          <div className="text-3xl font-bold text-center p-4 bg-muted rounded-lg border-2 border-border">
            {formatMontant(parseInt(montant) || 0)}
          </div>
        </div>

        {/* Calculator */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-3 grid grid-cols-3 gap-2">
            {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', 'DEL'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={cn(
                  'p-3 rounded-lg font-semibold transition-all border-2',
                  key === 'C' 
                    ? 'border-destructive/50 text-destructive hover:bg-destructive/10' 
                    : key === 'DEL'
                    ? 'border-warning/50 text-warning hover:bg-warning/10'
                    : 'border-border hover:border-accent hover:bg-accent/10'
                )}
              >
                {key === 'DEL' ? <Delete className="w-4 h-4 mx-auto" /> : key}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleQuickAmount(1000)}
              className="flex-1 p-2 text-xs font-semibold rounded-lg border-2 border-accent/50 text-accent hover:bg-accent/10"
            >
              +1k
            </button>
            <button
              onClick={() => handleQuickAmount(5000)}
              className="flex-1 p-2 text-xs font-semibold rounded-lg border-2 border-accent/50 text-accent hover:bg-accent/10"
            >
              +5k
            </button>
            <button
              onClick={() => handleQuickAmount(10000)}
              className="flex-1 p-2 text-xs font-semibold rounded-lg border-2 border-accent/50 text-accent hover:bg-accent/10"
            >
              +10k
            </button>
            <button
              onClick={() => handleQuickAmount(50000)}
              className="flex-1 p-2 text-xs font-semibold rounded-lg border-2 border-accent text-accent-foreground bg-accent hover:bg-accent/90"
            >
              +50k
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: 2 bouteilles d'eau"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Annuler</Button>
          <Button 
            onClick={handleSubmit}
            disabled={parseInt(montant) <= 0 || isSubmitting}
            className="gap-2 bg-accent hover:bg-accent/90"
          >
            <Check className="w-4 h-4" />
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}