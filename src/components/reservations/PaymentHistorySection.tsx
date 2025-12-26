import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Clock, Banknote, Smartphone, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EncaisserDialog } from '@/components/comptes/EncaisserDialog';
import { MethodePaiement, useComptes } from '@/hooks/useComptes';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
  clientName?: string;
  chambreNum?: string;
  reservationId?: string;
  hotelId?: string;
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

export function PaymentHistorySection({ 
  compteId, 
  totalPrice, 
  acompte,
  clientName,
  chambreNum,
  reservationId,
  hotelId
}: PaymentHistorySectionProps) {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const { encaisserPaiement } = useComptes();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPaye, setTotalPaye] = useState(0);
  const [showEncaisser, setShowEncaisser] = useState(false);
  const [currentCompteId, setCurrentCompteId] = useState<string | null>(compteId || null);

  const fetchPaiements = useCallback(async () => {
    if (!currentCompteId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('paiements_compte')
        .select('*')
        .eq('compte_id', currentCompteId)
        .order('date_paiement', { ascending: false });

      if (error) throw error;
      setPaiements(data || []);
      setTotalPaye((data || []).reduce((sum, p) => sum + (p.montant || 0), 0));
    } catch (error) {
      console.error('Error fetching paiements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompteId]);

  useEffect(() => {
    setCurrentCompteId(compteId || null);
  }, [compteId]);

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  const reste = totalPrice - totalPaye;

  // Create compte if doesn't exist, then record payment
  const handlePaymentConfirm = async (
    montant: number, 
    methode: MethodePaiement, 
    reference?: string
  ): Promise<boolean> => {
    try {
      let compteToUse = currentCompteId;

      // If no compte exists, create one first
      if (!compteToUse && reservationId && hotelId) {
        const { data: newCompte, error: compteError } = await supabase
          .from('comptes_clients')
          .insert({
            hotel_id: hotelId,
            reservation_id: reservationId,
            total_facture: totalPrice,
            created_by: user?.id
          })
          .select()
          .single();

        if (compteError) throw compteError;
        compteToUse = newCompte.id;
        setCurrentCompteId(compteToUse);

        // Also link compte to reservation
        await supabase
          .from('reservations')
          .update({ compte_id: compteToUse })
          .eq('id', reservationId);
      }

      if (!compteToUse) {
        toast.error('Impossible de créer le compte client');
        return false;
      }

      // Record the payment
      const success = await encaisserPaiement(compteToUse, montant, methode, reference);
      
      if (success) {
        await fetchPaiements();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Erreur lors de l\'enregistrement du paiement');
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Calculate effective reste based on acompte if no payments yet
  const effectiveAcompte = acompte || 0;
  const resteEffectif = currentCompteId ? reste : (totalPrice - effectiveAcompte);
  const canPay = resteEffectif > 0;

  // If no compte yet, show acompte status
  if (!currentCompteId) {
    return (
      <>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Paiements
            </h4>
            {canPay && reservationId && hotelId && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowEncaisser(true)}
                className="gap-1 text-xs h-7"
              >
                <Plus className="w-3 h-3" />
                Encaisser
              </Button>
            )}
          </div>
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
              <span className={`font-semibold ${resteEffectif > 0 ? 'text-warning' : 'text-success'}`}>
                {formatCurrency(resteEffectif)}
              </span>
            </div>
          </div>
        </div>

        <EncaisserDialog
          open={showEncaisser}
          onOpenChange={setShowEncaisser}
          onConfirm={handlePaymentConfirm}
          soldeRestant={resteEffectif}
          clientName={clientName}
          chambreNum={chambreNum}
        />
      </>
    );
  }

  return (
    <>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Historique des paiements ({paiements.length})
          </h4>
          {canPay && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowEncaisser(true)}
              className="gap-1 text-xs h-7"
            >
              <Plus className="w-3 h-3" />
              Encaisser
            </Button>
          )}
        </div>

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

      <EncaisserDialog
        open={showEncaisser}
        onOpenChange={setShowEncaisser}
        onConfirm={handlePaymentConfirm}
        soldeRestant={reste}
        clientName={clientName}
        chambreNum={chambreNum}
      />
    </>
  );
}
