import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Setup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const { data: newHotel, error: hotelError } = await supabase
        .from('hotels')
        .insert({
          name: hotelData.name.trim(),
          address: hotelData.address.trim() || null,
          phone: hotelData.phone.trim() || null,
          email: hotelData.email.trim() || null,
        })
        .select()
        .single();

      if (hotelError) {
        throw new Error(hotelError.message);
      }

      // Step 2: Update user profile with hotel_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ hotel_id: newHotel.id })
        .eq('id', user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Step 3: Create owner role for user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'owner',
        });

      if (roleError) {
        throw new Error(roleError.message);
      }

      // Success!
      setStep(2);
      
      toast({
        title: 'Hôtel créé avec succès !',
        description: `${newHotel.name} est prêt à être utilisé.`,
      });

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

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
              <p className="text-muted-foreground mb-6">
                Votre hôtel <span className="font-medium text-foreground">{hotelData.name}</span> est configuré.
                <br />
                Vous êtes maintenant propriétaire et administrateur.
              </p>
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
