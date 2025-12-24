import { useState, useMemo } from 'react';
import { Calendar, CreditCard, FileText, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client, useHotel } from '@/contexts/HotelContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

interface ClientHistoryDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientHistoryDialog = ({ client, open, onOpenChange }: ClientHistoryDialogProps) => {
  const { reservations, rooms } = useHotel();
  const { formatCurrency } = useCurrency();

  if (!client) return null;

  const clientReservations = useMemo(() => {
    return reservations
      .filter(r => r.client_id === client.id)
      .sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime());
  }, [reservations, client.id]);

  const stats = useMemo(() => {
    let totalDays = 0;
    let totalSpent = 0;

    clientReservations.forEach(res => {
      if (res.status === 'checked_out' || res.status === 'checked_in') {
        const checkIn = parseISO(res.check_in);
        const checkOut = parseISO(res.check_out);
        const days = differenceInDays(checkOut, checkIn);
        totalDays += days > 0 ? days : 1;
      }
      if (res.payment_status === 'paid') {
        totalSpent += res.total_price || 0;
      }
    });

    return { totalDays, totalSpent };
  }, [clientReservations]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'checked_out': return 'Terminé';
      case 'checked_in': return 'En cours';
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'partial': return 'Partiel';
      case 'pending': return 'En attente';
      default: return status;
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
              {client.first_name[0]}{client.last_name[0]}
            </div>
            <span>Historique de {client.first_name} {client.last_name}</span>
          </DialogTitle>
          <DialogDescription>
            Historique complet des séjours et paiements
          </DialogDescription>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalDays}</p>
              <p className="text-sm text-muted-foreground">jours passés</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
            <DollarSign className="w-8 h-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalSpent)}</p>
              <p className="text-sm text-muted-foreground">dépensé au total</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="reservations" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reservations" className="gap-2">
              <Calendar className="w-4 h-4" />
              Réservations ({clientReservations.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Paiements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations" className="flex-1 overflow-y-auto mt-4">
            {clientReservations.length > 0 ? (
              <div className="space-y-3">
                {clientReservations.map((res) => {
                  const room = rooms.find(r => r.id === res.room_id);
                  const checkIn = parseISO(res.check_in);
                  const checkOut = parseISO(res.check_out);
                  const nights = differenceInDays(checkOut, checkIn);
                  
                  return (
                    <div key={res.id} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              Chambre {room?.number || 'N/A'}
                            </span>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              res.status === 'checked_out' && "bg-muted text-muted-foreground",
                              res.status === 'checked_in' && "bg-primary/20 text-primary",
                              res.status === 'confirmed' && "bg-accent/20 text-accent",
                              res.status === 'pending' && "bg-yellow-500/20 text-yellow-600",
                              res.status === 'cancelled' && "bg-destructive/20 text-destructive",
                            )}>
                              {getStatusLabel(res.status)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {room?.type || 'Type inconnu'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(res.total_price || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {nights} nuit{nights > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(res.check_in)} → {formatDate(res.check_out)}</span>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          res.payment_status === 'paid' && "bg-green-500/20 text-green-600",
                          res.payment_status === 'partial' && "bg-yellow-500/20 text-yellow-600",
                          res.payment_status === 'pending' && "bg-muted text-muted-foreground",
                        )}>
                          {getPaymentStatusLabel(res.payment_status)}
                        </span>
                      </div>

                      {res.notes && (
                        <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <p className="text-muted-foreground">{res.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Aucune réservation</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="flex-1 overflow-y-auto mt-4">
            {clientReservations.filter(r => r.payment_status === 'paid' || r.payment_status === 'partial').length > 0 ? (
              <div className="space-y-3">
                {clientReservations
                  .filter(r => r.payment_status === 'paid' || r.payment_status === 'partial')
                  .map((res) => {
                    const room = rooms.find(r => r.id === res.room_id);
                    
                    return (
                      <div key={res.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              Séjour du {formatDate(res.check_in)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Chambre {room?.number || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-accent">
                              {formatCurrency(res.total_price || 0)}
                            </p>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              res.payment_status === 'paid' && "bg-green-500/20 text-green-600",
                              res.payment_status === 'partial' && "bg-yellow-500/20 text-yellow-600",
                            )}>
                              {getPaymentStatusLabel(res.payment_status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Aucun paiement enregistré</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
