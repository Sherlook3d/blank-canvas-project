import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, ArrowRight, CheckCircle, Loader2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const createDemoData = async (hotelId: string) => {
  // Create demo rooms
  const roomsData = [
    { hotel_id: hotelId, number: '101', type: 'standard', capacity: 2, price_per_night: 85, floor: 1, status: 'available', amenities: ['WiFi', 'TV Canal+', 'Eau chaude'] },
    { hotel_id: hotelId, number: '102', type: 'standard', capacity: 2, price_per_night: 85, floor: 1, status: 'available', amenities: ['WiFi', 'TV Canal+', 'Eau chaude'] },
    { hotel_id: hotelId, number: '103', type: 'standard', capacity: 2, price_per_night: 85, floor: 1, status: 'maintenance', amenities: ['WiFi', 'TV Canal+', 'Eau chaude'] },
    { hotel_id: hotelId, number: '201', type: 'double', capacity: 3, price_per_night: 120, floor: 2, status: 'available', amenities: ['WiFi', 'TV Canal+', 'Eau chaude', 'Minibar'] },
    { hotel_id: hotelId, number: '202', type: 'double', capacity: 3, price_per_night: 120, floor: 2, status: 'occupied', amenities: ['WiFi', 'TV Canal+', 'Eau chaude', 'Minibar'] },
    { hotel_id: hotelId, number: '301', type: 'suite', capacity: 4, price_per_night: 200, floor: 3, status: 'available', amenities: ['WiFi', 'TV Canal+', 'Eau chaude', 'Minibar', 'Jacuzzi', 'Vue mer'] },
    { hotel_id: hotelId, number: '302', type: 'suite', capacity: 4, price_per_night: 250, floor: 3, status: 'available', amenities: ['WiFi', 'TV Canal+', 'Eau chaude', 'Minibar', 'Jacuzzi', 'Vue mer', 'Balcon'] },
  ];

  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .insert(roomsData)
    .select();

  if (roomsError) throw roomsError;

  // Create demo clients
  const clientsData = [
    { hotel_id: hotelId, first_name: 'Jean', last_name: 'Dupont', email: 'jean.dupont@email.com', phone: '+33 6 12 34 56 78', nationality: 'France', id_type: 'CNI', id_number: 'FR123456', vip: false },
    { hotel_id: hotelId, first_name: 'Marie', last_name: 'Martin', email: 'marie.martin@email.com', phone: '+33 6 98 76 54 32', nationality: 'France', id_type: 'Passeport', id_number: 'FR789012', vip: true },
    { hotel_id: hotelId, first_name: 'Pierre', last_name: 'Bernard', email: 'pierre.bernard@email.com', phone: '+33 6 55 44 33 22', nationality: 'Belgique', id_type: 'CNI', id_number: 'BE456789', company: 'TechCorp', vip: false },
    { hotel_id: hotelId, first_name: 'Sophie', last_name: 'Petit', email: 'sophie.petit@email.com', phone: '+33 6 11 22 33 44', nationality: 'Suisse', id_type: 'Passeport', id_number: 'CH112233', vip: true },
    { hotel_id: hotelId, first_name: 'Lucas', last_name: 'Moreau', email: 'lucas.moreau@email.com', phone: '+33 6 77 88 99 00', nationality: 'France', id_type: 'CNI', id_number: 'FR334455', vip: false },
  ];

  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .insert(clientsData)
    .select();

  if (clientsError) throw clientsError;

  // Create demo reservations
  const today = new Date();
  const reservationsData = [
    {
      hotel_id: hotelId,
      room_id: rooms![4].id, // Room 202 (occupied)
      client_id: clients![0].id, // Jean Dupont
      check_in: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      check_out: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'checked_in',
      payment_status: 'paid',
      total_price: 600,
      notes: 'Client régulier, chambre calme demandée',
    },
    {
      hotel_id: hotelId,
      room_id: rooms![0].id, // Room 101
      client_id: clients![1].id, // Marie Martin (VIP)
      check_in: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      check_out: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'confirmed',
      payment_status: 'partial',
      total_price: 255,
      notes: 'Cliente VIP - Prévoir bouquet de fleurs',
    },
    {
      hotel_id: hotelId,
      room_id: rooms![5].id, // Room 301 (suite)
      client_id: clients![2].id, // Pierre Bernard
      check_in: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      check_out: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      payment_status: 'pending',
      total_price: 600,
      notes: 'Voyage d\'affaires - Facture entreprise TechCorp',
    },
    {
      hotel_id: hotelId,
      room_id: rooms![3].id, // Room 201
      client_id: clients![3].id, // Sophie Petit (VIP)
      check_in: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      check_out: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'confirmed',
      payment_status: 'paid',
      total_price: 480,
    },
  ];

  const { error: reservationsError } = await supabase
    .from('reservations')
    .insert(reservationsData);

  if (reservationsError) throw reservationsError;

  return { roomsCount: rooms!.length, clientsCount: clients!.length, reservationsCount: reservationsData.length };
};

export default function Setup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addDemoData, setAddDemoData] = useState(true);
  const [demoStats, setDemoStats] = useState<{ roomsCount: number; clientsCount: number; reservationsCount: number } | null>(null);
  const [hotelData, setHotelData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // Redirect if user already has a hotel
  if (profile?.hotel_id) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Erreur', description: 'Vous devez être connecté', variant: 'destructive' });
      return;
    }

    if (!hotelData.name.trim()) {
      toast({ title: 'Erreur', description: 'Le nom de l\'hôtel est requis', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the hotel
      // Important: we must NOT rely on returning/select here because the SELECT RLS policy
      // depends on profile.hotel_id (which is still NULL at this moment).
      const hotelId = crypto.randomUUID();

      const { error: hotelError } = await supabase
        .from('hotels')
        .insert({
          id: hotelId,
          name: hotelData.name.trim(),
          address: hotelData.address.trim() || null,
          phone: hotelData.phone.trim() || null,
          email: hotelData.email.trim() || null,
        });

      if (hotelError) throw new Error(hotelError.message);

      // Step 2: Update user profile with hotel_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ hotel_id: hotelId })
        .eq('id', user.id);

      if (profileError) throw new Error(profileError.message);

      // Step 3: Create owner role for user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'owner',
        });

      if (roleError) throw new Error(roleError.message);

      // Step 4: Add demo data if requested
      let stats = null;
      if (addDemoData) {
        try {
          stats = await createDemoData(hotelId);
          setDemoStats(stats);
        } catch (demoError: any) {
          console.error('Demo data error:', demoError);
          // Don't fail setup if demo data fails
        }
      }

      // Success!
      setStep(2);

      const hotelName = hotelData.name.trim();

      toast({
        title: 'Hôtel créé avec succès !',
        description:
          addDemoData && stats
            ? `${hotelName} est prêt avec ${stats.roomsCount} chambres, ${stats.clientsCount} clients et ${stats.reservationsCount} réservations.`
            : `${hotelName} est prêt à être utilisé.`,
      });

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error: any) {
      console.error('Setup error:', error);
      toast({
        title: 'Erreur lors de la configuration',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Configuration initiale</h1>
          <p className="text-muted-foreground mt-1">Créez votre hôtel pour commencer</p>
        </div>

        {step === 1 ? (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" />
                Informations de l'hôtel
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos factures et documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'hôtel *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={hotelData.name}
                      onChange={(e) => setHotelData({ ...hotelData, name: e.target.value })}
                      placeholder="Grand Hôtel de Paris"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={hotelData.address}
                      onChange={(e) => setHotelData({ ...hotelData, address: e.target.value })}
                      placeholder="123 Avenue des Champs-Élysées, 75008 Paris"
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={hotelData.phone}
                        onChange={(e) => setHotelData({ ...hotelData, phone: e.target.value })}
                        placeholder="+33 1 23 45 67 89"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={hotelData.email}
                        onChange={(e) => setHotelData({ ...hotelData, email: e.target.value })}
                        placeholder="contact@hotel.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Demo data checkbox */}
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <Checkbox
                    id="demo-data"
                    checked={addDemoData}
                    onCheckedChange={(checked) => setAddDemoData(checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="demo-data" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <Database className="w-4 h-4 text-accent" />
                      Ajouter des données de démonstration
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      7 chambres, 5 clients et 4 réservations seront créés pour vous aider à découvrir l'application
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full gap-2" 
                    disabled={isSubmitting || !hotelData.name.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Configuration en cours...
                      </>
                    ) : (
                      <>
                        Créer mon hôtel
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card animate-scale-in">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Félicitations !
              </h2>
              <p className="text-muted-foreground mb-4">
                Votre hôtel <span className="font-medium text-foreground">{hotelData.name}</span> est configuré.
                <br />
                Vous êtes maintenant propriétaire et administrateur.
              </p>
              
              {demoStats && (
                <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{demoStats.roomsCount}</div>
                    <div className="text-xs text-muted-foreground">Chambres</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{demoStats.clientsCount}</div>
                    <div className="text-xs text-muted-foreground">Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{demoStats.reservationsCount}</div>
                    <div className="text-xs text-muted-foreground">Réservations</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirection vers le tableau de bord...
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Vous pourrez modifier ces informations dans les paramètres
        </p>
      </div>
    </div>
  );
}