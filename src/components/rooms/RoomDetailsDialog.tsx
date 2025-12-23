import { useState } from 'react';
import { BedDouble, Users, Wifi, Wind, Wine, Bath, Edit2, Trash2, User } from 'lucide-react';
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
import { Room, RoomType, RoomStatus, useHotel, Client, Reservation } from '@/contexts/HotelContext';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface RoomDetailsDialogProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
};

const amenityIcons: Record<string, React.ElementType> = {
  'Wi-Fi': Wifi,
  'Climatisation': Wind,
  'Minibar': Wine,
  'Baignoire': Bath,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const RoomDetailsDialog = ({ room, open, onOpenChange }: RoomDetailsDialogProps) => {
  const { reservations, updateRoom, deleteRoom } = useHotel();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState({
    number: '',
    type: 'double' as RoomType,
    floor: 1,
    capacity: 2,
    price_per_night: 0,
    status: 'available' as RoomStatus,
    description: '',
  });

  if (!room) return null;

  // Get current occupant
  const activeReservation = reservations.find(
    r => r.room_id === room.id && r.status === 'checked_in' && r.client
  );

  const handleEdit = () => {
    setEditData({
      number: room.number,
      type: room.type,
      floor: room.floor || 1,
      capacity: room.capacity,
      price_per_night: room.price_per_night,
      status: room.status,
      description: room.description || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const success = await updateRoom(room.id, {
      number: editData.number,
      type: editData.type,
      floor: editData.floor,
      capacity: editData.capacity,
      price_per_night: editData.price_per_night,
      status: editData.status,
      description: editData.description || null,
    });
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const success = await deleteRoom(room.id);
    setIsSubmitting(false);
    if (success) {
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <BedDouble className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{roomTypeLabels[room.type]} {room.number}</span>
                  <StatusBadge status={room.status} />
                </div>
                <p className="text-sm font-normal text-muted-foreground">
                  Étage {room.floor} • {room.capacity} pers.
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Détails de la chambre
            </DialogDescription>
          </DialogHeader>

          {isEditing ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_number">Numéro</Label>
                  <Input
                    id="edit_number"
                    value={editData.number}
                    onChange={(e) => setEditData({ ...editData, number: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_floor">Étage</Label>
                  <Input
                    id="edit_floor"
                    type="number"
                    value={editData.floor}
                    onChange={(e) => setEditData({ ...editData, floor: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_type">Type</Label>
                  <Select value={editData.type} onValueChange={(v) => setEditData({ ...editData, type: v as RoomType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Simple</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="family">Familiale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_capacity">Capacité</Label>
                  <Input
                    id="edit_capacity"
                    type="number"
                    value={editData.capacity}
                    onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) || 2 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_price">Prix/nuit</Label>
                  <Input
                    id="edit_price"
                    type="number"
                    value={editData.price_per_night}
                    onChange={(e) => setEditData({ ...editData, price_per_night: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_status">Statut</Label>
                  <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v as RoomStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="occupied">Occupée</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="cleaning">Nettoyage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Price */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Prix par nuit</span>
                <span className="text-lg font-semibold text-foreground">{formatCurrency(room.price_per_night)}</span>
              </div>

              {/* Description */}
              {room.description && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                </div>
              )}

              {/* Amenities */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Équipements</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity];
                    return (
                      <div key={amenity} className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-sm">
                        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Occupant */}
              {room.status === 'occupied' && activeReservation?.client && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Occupant actuel</h4>
                  <div className="flex items-center gap-3 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {activeReservation.client.first_name} {activeReservation.client.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeReservation.client.phone || activeReservation.client.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting || !editData.number}>
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
            <AlertDialogTitle>Supprimer cette chambre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La chambre {room.number} sera définitivement supprimée.
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
