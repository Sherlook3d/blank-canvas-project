import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MethodePaiement, getIconMethode, formatMontant } from '@/hooks/useComptes';
import { cn } from '@/lib/utils';
import { Delete, Check } from 'lucide-react';

const METHODES: MethodePaiement[] = ['Espèces', 'Carte Bancaire', 'Mobile Money', 'Virement'];

interface EncaisserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (montant: number, methode: MethodePaiement, reference?: string, remarque?: string) => Promise<boolean>;
  soldeRestant: number;
  clientName?: string;
  chambreNum?: string;
}

export function EncaisserDialog({
  open,
  onOpenChange,
  onConfirm,
  soldeRestant,
  clientName,
  chambreNum
}: EncaisserDialogProps) {
  const [selectedMethode, setSelectedMethode] = useState<MethodePaiement>('Espèces');
  const [montant, setMontant] = useState(soldeRestant.toString());
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      setMontant('0');
    } else if (key === 'DEL') {
      setMontant(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setMontant(prev => prev === '0' ? key : prev + key);
    }
  };

  const handlePercentage = (percent: number) => {
    const amount = Math.round(soldeRestant * percent / 100);
    setMontant(amount.toString());
  };

  const handleSubmit = async () => {
    const numMontant = parseFloat(montant);
    if (numMontant <= 0) return;

    setIsSubmitting(true);
    const success = await onConfirm(numMontant, selectedMethode, reference || undefined);
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const resetAndClose = () => {
    setMontant(soldeRestant.toString());
    setReference('');
    setSelectedMethode('Espèces');
    onOpenChange(false);
  };

  // Reset montant when solde changes
  useState(() => {
    setMontant(soldeRestant.toString());
  });

  const numMontant = parseInt(montant) || 0;
  const nouveauSolde = soldeRestant - numMontant;

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💰 Encaisser paiement
            {chambreNum && <span className="text-sm font-normal text-muted-foreground">• Ch. {chambreNum}</span>}
          </DialogTitle>
          {clientName && (
            <p className="text-sm text-muted-foreground">{clientName}</p>
          )}
        </DialogHeader>

        {/* Solde Info */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Solde à payer</span>
            <span className="font-bold text-warning">{formatMontant(soldeRestant)}</span>
          </div>
        </div>

        {/* Montant Display */}
        <div className="space-y-2">
          <Label>Montant à encaisser</Label>
          <div className="text-3xl font-bold text-center p-4 bg-muted rounded-lg border-2 border-border">
            {formatMontant(numMontant)}
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => handlePercentage(percent)}
              className={cn(
                'p-2 rounded-lg font-semibold border-2 transition-all',
                numMontant === Math.round(soldeRestant * percent / 100)
                  ? 'border-success bg-success text-success-foreground'
                  : 'border-success/50 text-success hover:bg-success/10'
              )}
            >
              {percent}%
            </button>
          ))}
        </div>

        {/* Calculator */}
        <div className="grid grid-cols-3 gap-2">
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

        {/* Méthode Selector */}
        <div className="space-y-2">
          <Label>Méthode de paiement</Label>
          <div className="grid grid-cols-4 gap-2">
            {METHODES.map((methode) => (
              <button
                key={methode}
                onClick={() => setSelectedMethode(methode)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                  selectedMethode === methode
                    ? 'border-success bg-success text-success-foreground'
                    : 'border-border hover:border-success/50 hover:bg-muted'
                )}
              >
                <span className="text-xl">{getIconMethode(methode)}</span>
                <span className="text-xs font-medium text-center">{methode}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reference (for card/transfer) */}
        {(selectedMethode === 'Carte Bancaire' || selectedMethode === 'Virement') && (
          <div className="space-y-2">
            <Label htmlFor="reference">Référence</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Numéro de transaction..."
            />
          </div>
        )}

        {/* Nouveau Solde */}
        <div className="p-3 rounded-lg bg-muted">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Nouveau solde</span>
            <span className={cn(
              'font-bold',
              nouveauSolde <= 0 ? 'text-success' : 'text-foreground'
            )}>
              {nouveauSolde <= 0 ? 'Soldé ✓' : formatMontant(nouveauSolde)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Annuler</Button>
          <Button 
            onClick={handleSubmit}
            disabled={numMontant <= 0 || isSubmitting}
            className="gap-2 bg-success hover:bg-success/90"
          >
            <Check className="w-4 h-4" />
            Encaisser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
