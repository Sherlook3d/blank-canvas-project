import { useState } from 'react';
import { Mail, Phone, MapPin, Star, Calendar, Edit2, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Client, useHotel, Reservation } from '@/contexts/HotelContext';
import { cn } from '@/lib/utils';

interface ClientDetailsDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientDetailsDialog = ({ client, open, onOpenChange }: ClientDetailsDialogProps) => {
  const { reservations, updateClient, deleteClient } = useHotel();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    nationality: '',
    notes: '',
    vip: false,
  });

  if (!client) return null;

  const clientReservations = reservations.filter(r => r.client_id === client.id);

  const handleEdit = () => {
    setEditData({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      nationality: client.nationality || '',
      notes: client.notes || '',
      vip: client.vip,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const success = await updateClient(client.id, {
      first_name: editData.first_name,
      last_name: editData.last_name,
      email: editData.email || null,
      phone: editData.phone || null,
      address: editData.address || null,
      nationality: editData.nationality || null,
      notes: editData.notes || null,
      vip: editData.vip,
    });
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const success = await deleteClient(client.id);
    setIsSubmitting(false);
    if (success) {
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                {client.first_name[0]}{client.last_name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{client.first_name} {client.last_name}</span>
                  {client.vip && <Star className="w-4 h-4 fill-accent text-accent" />}
                </div>
                {client.nationality && (
                  <p className="text-sm font-normal text-muted-foreground">{client.nationality}</p>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              Fiche client détaillée
            </DialogDescription>
          </DialogHeader>

          {isEditing ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_first_name">Prénom</Label>
                  <Input
                    id="edit_first_name"
                    value={editData.first_name}
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_last_name">Nom</Label>
                  <Input
                    id="edit_last_name"
                    value={editData.last_name}
                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_phone">Téléphone</Label>
                <Input
                  id="edit_phone"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_nationality">Nationalité</Label>
                <Input
                  id="edit_nationality"
                  value={editData.nationality}
                  onChange={(e) => setEditData({ ...editData, nationality: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_address">Adresse</Label>
                <Input
                  id="edit_address"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                />
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_vip"
                  checked={editData.vip}
                  onChange={(e) => setEditData({ ...editData, vip: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="edit_vip" className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent" />
                  Client VIP
                </Label>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Contact Info */}
              <div className="space-y-2">
                {client.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {client.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </div>
              )}

              {/* Reservations History */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Historique des réservations</h4>
                {clientReservations.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {clientReservations.slice(0, 5).map((res) => (
                      <div key={res.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{formatDate(res.check_in)} - {formatDate(res.check_out)}</span>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          res.status === 'checked_out' && "bg-muted text-muted-foreground",
                          res.status === 'checked_in' && "bg-primary/20 text-primary",
                          res.status === 'confirmed' && "bg-accent/20 text-accent",
                          res.status === 'pending' && "bg-yellow-500/20 text-yellow-600",
                        )}>
                          {res.room?.number || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune réservation</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting || !editData.first_name || !editData.last_name}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données de {client.first_name} {client.last_name} seront supprimées.
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
