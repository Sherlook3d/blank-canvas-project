import { useState, useEffect } from 'react';
import { BedDouble, Trash2 } from 'lucide-react';
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
import { Room, RoomType, RoomStatus, useHotel } from '@/contexts/HotelContext';
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
  bungalow: 'Bungalow',
};

export const RoomDetailsDialog = ({ room, open, onOpenChange }: RoomDetailsDialogProps) => {
  const { updateRoom, deleteRoom } = useHotel();
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
    amenities: [] as string[],
  });

  // Pré-remplir le formulaire à chaque ouverture avec les données de la chambre
  useEffect(() => {
    if (open && room) {
      setEditData({
        number: room.number,
        type: room.type,
        floor: room.floor || 1,
        capacity: room.capacity,
        price_per_night: room.price_per_night,
        status: room.status,
        description: room.description || '',
        amenities: room.amenities || [],
      });
    }
  }, [open, room]);

  if (!room) return null;

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
      amenities: editData.amenities,
    });
    setIsSubmitting(false);
    if (success) {
      onOpenChange(false);
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
              Modifier la chambre
            </DialogDescription>
          </DialogHeader>

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
                <Select
                  value={editData.type}
                  onValueChange={(v) => setEditData({ ...editData, type: v as RoomType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="family">Familiale</SelectItem>
                    <SelectItem value="single">Simple</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_capacity">Capacité (personnes)</Label>
                <Input
                  id="edit_capacity"
                  type="number"
                  value={editData.capacity}
                  onChange={(e) => setEditData({
                    ...editData,
                    capacity: parseInt(e.target.value) || 2,
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_price">Prix/nuit (Ar)</Label>
                <Input
                  id="edit_price"
                  type="number"
                  value={editData.price_per_night}
                  onChange={(e) => setEditData({
                    ...editData,
                    price_per_night: parseFloat(e.target.value) || 0,
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_status">Statut</Label>
                <Select
                  value={editData.status}
                  onValueChange={(v) => setEditData({ ...editData, status: v as RoomStatus })}
                >
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
              <Label>Lit</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['1 Lit (2 places)', '1 Lit (1 place)'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border bg-background"
                      checked={editData.amenities.includes(amenity)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditData((prev) => ({
                          ...prev,
                          amenities: checked
                            ? [...prev.amenities, amenity]
                            : prev.amenities.filter((a) => a !== amenity),
                        }));
                      }}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Options</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['Ventilateur', 'Climatisation', 'WiFi', 'TV', 'Eau chaude', 'Minibar', 'Balcon', 'Jacuzzi', 'Vue mer'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border bg-background"
                      checked={editData.amenities.includes(amenity)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditData((prev) => ({
                          ...prev,
                          amenities: checked
                            ? [...prev.amenities, amenity]
                            : prev.amenities.filter((a) => a !== amenity),
                        }));
                      }}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
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

          <DialogFooter className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting || !editData.number}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
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
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
