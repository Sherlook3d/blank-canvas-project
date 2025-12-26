import { Mail, Phone, MapPin, ExternalLink, Code2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Contact = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-xl animate-fade-in">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">RStudio</CardTitle>
            <CardDescription className="text-base">
              Solutions logicielles sur mesure
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Développé par <span className="font-semibold text-foreground">Mahandry</span>
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Nous contacter
              </h3>
              
              <div className="grid gap-3">
                <a 
                  href="tel:+261341092223" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">034 10 922 23</p>
                    <p className="text-xs text-muted-foreground">Ligne principale</p>
                  </div>
                </a>
                
                <a 
                  href="tel:+261322266779" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">032 22 667 79</p>
                    <p className="text-xs text-muted-foreground">Ligne secondaire</p>
                  </div>
                </a>
              </div>
            </div>

            <Separator />

            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                HotelManager est un produit de
              </p>
              <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RStudio - Mahandry
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                © {new Date().getFullYear()} Tous droits réservés
              </p>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
                Retour à l'application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
