import { useState } from 'react';
import { Calendar, BedDouble, User, CreditCard, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Reservation, ReservationStatus, PaymentStatus, RoomType, useHotel } from '@/contexts/HotelContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DebtBadge } from '@/components/ui/DebtBadge';
import { PaymentHistorySection } from './PaymentHistorySection';

interface ReservationDetailsDialogProps {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const ReservationDetailsDialog = ({ reservation, open, onOpenChange }: ReservationDetailsDialogProps) => {
  const { updateReservation, deleteReservation } = useHotel();
  const { formatCurrency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState({
    status: 'pending' as ReservationStatus,
    payment_status: 'pending' as PaymentStatus,
    notes: '',
  });

  if (!reservation) return null;

  const nights = calculateNights(reservation.check_in, reservation.check_out);

  const handleEdit = () => {
    setEditData({
      status: reservation.status,
      payment_status: reservation.payment_status,
      notes: reservation.notes || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const success = await updateReservation(reservation.id, {
      status: editData.status,
      payment_status: editData.payment_status,
      notes: editData.notes || null,
    });
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = async () => {
    setIsSubmitting(true);
    const success = await updateReservation(reservation.id, { status: 'cancelled' });
    setIsSubmitting(false);
    if (success) {
      setShowCancelConfirm(false);
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const success = await deleteReservation(reservation.id);
    setIsSubmitting(false);
    if (success) {
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>Réservation #{reservation.id.slice(0, 8)}</span>
                  <StatusBadge status={reservation.status} />
                </div>
                <p className="text-sm font-normal text-muted-foreground">
                  {nights} nuit{nights > 1 ? 's' : ''}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Détails de la réservation
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {isEditing ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_status">Statut</Label>
                  <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v as ReservationStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmée</SelectItem>
                      <SelectItem value="checked_in">En cours</SelectItem>
                      <SelectItem value="checked_out">Terminée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_payment">Paiement</Label>
                  <Select value={editData.payment_status} onValueChange={(v) => setEditData({ ...editData, payment_status: v as PaymentStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="partial">Partiel</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_notes">Notes</Label>
                  <Textarea
                    id="edit_notes"
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {/* Client with debt warning */}
                {reservation.client && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {reservation.client.first_name} {reservation.client.last_name}
                        </p>
                        <DebtBadge amount={reservation.client.argent_du || 0} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {reservation.client.email || reservation.client.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Debt Warning Alert */}
                {reservation.client && (reservation.client.argent_du || 0) > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Client avec impayés</p>
                      <p className="text-xs text-destructive/80">
                        Ce client doit {(reservation.client.argent_du || 0).toLocaleString()} Ar sur des séjours précédents
                      </p>
                    </div>
                  </div>
                )}

                {/* Room */}
                {reservation.room && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <BedDouble className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {roomTypeLabels[reservation.room.type]} {reservation.room.number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Étage {reservation.room.floor}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Arrivée</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(reservation.check_in)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Départ</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(reservation.check_out)}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total réservation</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(reservation.total_price)}</p>
                    <StatusBadge status={reservation.payment_status} className="text-xs" />
                  </div>
                </div>

                {/* Payment History */}
                <PaymentHistorySection 
                  compteId={reservation.compte_id} 
                  totalPrice={reservation.total_price}
                  acompte={reservation.acompte}
                  clientName={reservation.client ? `${reservation.client.first_name} ${reservation.client.last_name}` : undefined}
                  chambreNum={reservation.room?.number}
                  reservationId={reservation.id}
                  hotelId={reservation.hotel_id}
                />

                {/* Notes */}
                {reservation.notes && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground">{reservation.notes}</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                {reservation.status !== 'cancelled' && reservation.status !== 'checked_out' && (
                  <Button variant="outline" onClick={() => setShowCancelConfirm(true)}>
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                )}
                <Button variant="outline" onClick={handleEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              La réservation sera marquée comme annulée. Cette action peut être modifiée ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Non</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isSubmitting}>
              {isSubmitting ? 'Annulation...' : 'Oui, annuler'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La réservation sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
