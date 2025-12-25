import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, CreditCard, Printer, User, Calendar, BedDouble } from 'lucide-react';
import { CompteClient, LigneCompte, PaiementCompte, getIconType, getIconMethode, formatMontant } from '@/hooks/useComptes';
import { cn } from '@/lib/utils';

interface CompteDetailsDialogProps {
  compte: CompteClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddConsommation?: () => void;
  onEncaisser?: () => void;
}

export function CompteDetailsDialog({ 
  compte, 
  open, 
  onOpenChange, 
  onAddConsommation,
  onEncaisser 
}: CompteDetailsDialogProps) {
  if (!compte) return null;

  // Group lignes by date
  const groupedLignes = (compte.lignes || []).reduce((acc, ligne) => {
    const date = new Date(ligne.date_ligne).toLocaleDateString('fr-FR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(ligne);
    return acc;
  }, {} as Record<string, LigneCompte[]>);

  const soldeClass = compte.solde > 0 ? 'text-warning' : 'text-success';
  const statutClass = compte.statut === 'Soldé' ? 'bg-success/15 text-success' : 
                      compte.statut === 'Dette' ? 'bg-destructive/15 text-destructive' : 
                      'bg-warning/15 text-warning';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Compte {compte.numero}</span>
              <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statutClass)}>
                {compte.statut}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {/* Client & Room Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  {compte.client?.first_name} {compte.client?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{compte.client?.phone}</p>
              </div>
            </div>
            {compte.reservation?.room && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <BedDouble className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    Chambre {compte.reservation.room.number}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{compte.reservation.room.type}</p>
                </div>
              </div>
            )}
          </div>

          {/* Solde Card */}
          <div className="p-4 rounded-xl border-2 border-warning bg-warning/5 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Total facturé</span>
              <span className="font-semibold">{formatMontant(compte.total_facture)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Total payé</span>
              <span className="font-semibold text-success">{formatMontant(compte.total_paye)}</span>
            </div>
            <Separator className="my-3 bg-warning/30" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Solde à payer</span>
              <span className={cn('text-xl font-bold', soldeClass)}>
                {formatMontant(compte.solde)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={onAddConsommation}
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
            <Button 
              className="flex-1 gap-2 bg-accent hover:bg-accent/90"
              onClick={onEncaisser}
              disabled={compte.solde <= 0}
            >
              <CreditCard className="w-4 h-4" />
              Encaisser
            </Button>
          </div>

          {/* Historique Consommations */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Consommations</h3>
            {Object.keys(groupedLignes).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune consommation</p>
            ) : (
              Object.entries(groupedLignes).map(([date, lignes]) => (
                <div key={date} className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2 border-b border-border pb-1">
                    {date}
                  </p>
                  <div className="space-y-2">
                    {lignes.map((ligne) => (
                      <div 
                        key={ligne.id} 
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getIconType(ligne.type)}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{ligne.type}</p>
                            {ligne.description && (
                              <p className="text-xs text-muted-foreground">{ligne.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatMontant(ligne.montant)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Historique Paiements */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Paiements</h3>
            {(!compte.paiements || compte.paiements.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun paiement</p>
            ) : (
              <div className="space-y-2">
                {compte.paiements.map((paiement) => (
                  <div 
                    key={paiement.id} 
                    className="flex items-center justify-between p-3 bg-success/10 border-l-4 border-success rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getIconMethode(paiement.methode)}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{paiement.methode}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(paiement.date_paiement).toLocaleString('fr-FR')}
                        </p>
                        {paiement.reference && (
                          <p className="text-xs text-muted-foreground">Réf: {paiement.reference}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-success">
                      +{formatMontant(paiement.montant)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
