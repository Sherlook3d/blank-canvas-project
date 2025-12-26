import { useState, useEffect } from 'react';
import { CreditCard, Clock, Banknote, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Skeleton } from '@/components/ui/skeleton';

interface Paiement {
  id: string;
  montant: number;
  methode: string;
  date_paiement: string;
  reference: string | null;
  remarque: string | null;
}

interface PaymentHistorySectionProps {
  compteId: string | null | undefined;
  totalPrice: number;
  acompte?: number | null;
}

const getMethodeIcon = (methode: string) => {
  switch (methode.toLowerCase()) {
    case 'espèces':
    case 'acompte':
      return <Banknote className="w-4 h-4" />;
    case 'mobile money':
    case 'mvola':
    case 'orange money':
      return <Smartphone className="w-4 h-4" />;
    default:
      return <CreditCard className="w-4 h-4" />;
  }
};

export function PaymentHistorySection({ compteId, totalPrice, acompte }: PaymentHistorySectionProps) {
  const { formatCurrency } = useCurrency();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPaye, setTotalPaye] = useState(0);

  useEffect(() => {
    async function fetchPaiements() {
      if (!compteId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('paiements_compte')
          .select('*')
          .eq('compte_id', compteId)
          .order('date_paiement', { ascending: false });

        if (error) throw error;
        setPaiements(data || []);
        setTotalPaye((data || []).reduce((sum, p) => sum + (p.montant || 0), 0));
      } catch (error) {
        console.error('Error fetching paiements:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaiements();
  }, [compteId]);

  const reste = totalPrice - totalPaye;

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // If no compte yet, show acompte status
  if (!compteId) {
    const effectiveAcompte = acompte || 0;
    const resteInitial = totalPrice - effectiveAcompte;
    
    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Paiements
        </h4>
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          {effectiveAcompte > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Banknote className="w-4 h-4 text-success" />
                <span>Acompte versé</span>
              </div>
              <span className="font-medium text-success">{formatCurrency(effectiveAcompte)}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Aucun paiement enregistré
            </p>
          )}
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-medium">Reste à payer</span>
            <span className={`font-semibold ${resteInitial > 0 ? 'text-warning' : 'text-success'}`}>
              {formatCurrency(resteInitial)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        Historique des paiements ({paiements.length})
      </h4>

      {paiements.length === 0 ? (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Aucun paiement enregistré
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {paiements.map((paiement) => (
            <div 
              key={paiement.id} 
              className="flex items-center justify-between p-3 bg-success/10 border-l-4 border-success rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-success">
                  {getMethodeIcon(paiement.methode)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{paiement.methode}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(paiement.date_paiement).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {paiement.remarque && (
                    <p className="text-xs text-muted-foreground italic">{paiement.remarque}</p>
                  )}
                </div>
              </div>
              <span className="font-semibold text-success">
                +{formatCurrency(paiement.montant)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="p-3 bg-muted rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total facturé</span>
          <span className="font-medium">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total payé</span>
          <span className="font-medium text-success">{formatCurrency(totalPaye)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t">
          <span className="font-medium">Reste à payer</span>
          <span className={`font-semibold ${reste > 0 ? 'text-warning' : 'text-success'}`}>
            {formatCurrency(Math.max(0, reste))}
          </span>
        </div>
      </div>
    </div>
  );
}
