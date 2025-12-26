// ============================================
// 💰 INTERFACES FINANCIÈRES - HOTELMANAGER
// ============================================

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Printer, 
  Download,
  Plus,
  Phone,
  CheckCircle,
  Receipt,
  Wallet,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FinancesWorkflows, { 
  type Periode, 
  type KPI, 
  type Recette, 
  type Depense, 
  type Impaye, 
  type MouvementTresorerie,
  type CategorieDepense
} from '@/lib/finances-workflows';
import { useHotel } from '@/contexts/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================
// PAGE PRINCIPALE : GESTION FINANCIÈRE
// ============================================

export default function PageFinances() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [periode, setPeriode] = useState<Periode>('mois');
  const [dateSelectionnee] = useState(new Date());

  const periodeOptions: { value: Periode; label: string }[] = [
    { value: 'jour', label: "Aujourd'hui" },
    { value: 'semaine', label: 'Cette semaine' },
    { value: 'mois', label: 'Ce mois' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">💰 Gestion Financière</h1>
          <p className="text-muted-foreground mt-1">Suivi complet de vos finances</p>
        </div>
        
        {/* Sélecteur de période en boutons + Export */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {periodeOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={periode === opt.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriode(opt.value)}
                className={periode === opt.value ? '' : 'text-muted-foreground hover:text-foreground'}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => FinancesWorkflows.exporterBilanPDF(periode, dateSelectionnee)}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>

          <Button variant="outline" size="sm" onClick={() => FinancesWorkflows.exporterBilanExcel(periode, dateSelectionnee)}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="recettes">💵 Recettes</TabsTrigger>
          <TabsTrigger value="depenses">📉 Dépenses</TabsTrigger>
          <TabsTrigger value="impayees">⚠️ Impayés</TabsTrigger>
          <TabsTrigger value="tresorerie">💰 Trésorerie</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <OngletDashboard periode={periode} />
        </TabsContent>

        <TabsContent value="recettes">
          <OngletRecettes periode={periode} />
        </TabsContent>

        <TabsContent value="depenses">
          <OngletDepenses periode={periode} />
        </TabsContent>

        <TabsContent value="impayees">
          <OngletImpayees />
        </TabsContent>

        <TabsContent value="tresorerie">
          <OngletTresorerie />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// ONGLET 1 : TABLEAU DE BORD
// ============================================

function OngletDashboard({ periode }: { periode: Periode }) {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [evolution, setEvolution] = useState<{ labels: string[]; recettes: number[]; depenses: number[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [periode]);

  async function loadData() {
    setLoading(true);
    try {
      const kpisData = await FinancesWorkflows.getKPIs(periode);
      const evolutionData = await FinancesWorkflows.getEvolution6Mois();
      setKpis(kpisData);
      setEvolution(evolutionData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !kpis) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Recettes"
          value={kpis.recettes}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <KPICard
          title="Dépenses"
          value={kpis.depenses}
          icon={<Receipt className="w-6 h-6" />}
          color="red"
        />
        <KPICard
          title="Bénéfice"
          value={kpis.benefice}
          icon={<TrendingUp className="w-6 h-6" />}
          color={kpis.benefice >= 0 ? 'green' : 'red'}
        />
        <KPICard
          title="Impayés"
          value={kpis.impayees}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="orange"
        />
        <KPICard
          title="RevPAR"
          value={kpis.revpar}
          icon={<PiggyBank className="w-6 h-6" />}
          color="blue"
          subtitle="Revenu / chambre"
        />
        <KPICard
          title="Taux occupation"
          value={`${kpis.taux_occupation.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          isPercentage
        />
      </div>

      {/* Graphique évolution */}
      {evolution && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution sur 6 mois</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolution.labels.map((label, i) => ({
                mois: label,
                recettes: evolution.recettes[i],
                depenses: evolution.depenses[i],
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip formatter={(value) => FinancesWorkflows.formatMontant(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="recettes" stroke="hsl(var(--chart-2))" name="Recettes" strokeWidth={2} />
                <Line type="monotone" dataKey="depenses" stroke="hsl(var(--chart-1))" name="Dépenses" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// ONGLET 2 : RECETTES
// ============================================

function OngletRecettes({ periode }: { periode: Periode }) {
  const [recettes, setRecettes] = useState<{
    total: number;
    par_categorie: Record<string, number>;
    par_moyen: Record<string, number>;
    details: Recette[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecettes();
  }, [periode]);

  async function loadRecettes() {
    setLoading(true);
    try {
      const { debut, fin } = FinancesWorkflows.getDateRange(periode);
      const data = await FinancesWorkflows.getRecettesPeriode(debut, fin);
      setRecettes(data);
    } catch (error) {
      console.error('Error loading recettes:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !recettes) return <div className="text-center py-8">Chargement...</div>;

  const pieData = Object.entries(recettes.par_categorie).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* Total */}
      <Card>
        <CardHeader>
          <CardTitle>Recettes totales</CardTitle>
          <CardDescription>Période sélectionnée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">
            {FinancesWorkflows.formatMontant(recettes.total)}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => FinancesWorkflows.formatMontant(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        {/* Par moyen de paiement */}
        <Card>
          <CardHeader>
            <CardTitle>Par moyen de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(recettes.par_moyen).map(([moyen, montant]) => (
                <div key={moyen} className="flex justify-between items-center">
                  <span className="font-medium">{moyen}</span>
                  <span className="text-lg font-bold">{FinancesWorkflows.formatMontant(montant)}</span>
                </div>
              ))}
              {Object.keys(recettes.par_moyen).length === 0 && (
                <p className="text-muted-foreground text-center py-4">Aucune donnée</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste détaillée */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des recettes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Moyen paiement</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recettes.details.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{FinancesWorkflows.formatDate(r.date)}</TableCell>
                  <TableCell>{r.client_nom} {r.client_prenom}</TableCell>
                  <TableCell>{r.categorie}</TableCell>
                  <TableCell>{r.moyen_paiement}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {FinancesWorkflows.formatMontant(r.montant)}
                  </TableCell>
                </TableRow>
              ))}
              {recettes.details.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucune recette sur cette période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// ONGLET 3 : DÉPENSES
// ============================================

function OngletDepenses({ periode }: { periode: Periode }) {
  const { hotel } = useHotel();
  const [depenses, setDepenses] = useState<{
    total: number;
    par_categorie: Record<string, number>;
    details: Depense[];
  } | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepenses();
  }, [periode]);

  async function loadDepenses() {
    setLoading(true);
    try {
      const { debut, fin } = FinancesWorkflows.getDateRange(periode);
      const data = await FinancesWorkflows.getDepensesPeriode(debut, fin);
      setDepenses(data);
    } catch (error) {
      console.error('Error loading depenses:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !depenses) return <div className="text-center py-8">Chargement...</div>;

  const barData = Object.entries(depenses.par_categorie).map(([name, value]) => ({
    name,
    montant: value,
  }));

  return (
    <div className="space-y-6">
      {/* Header avec bouton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Card className="flex-1 w-full sm:w-auto">
          <CardHeader>
            <CardTitle>Dépenses totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">
              {FinancesWorkflows.formatMontant(depenses.total)}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle dépense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <FormulaireDepense 
              hotelId={hotel?.id || ''} 
              onSuccess={() => { 
                setShowDialog(false); 
                loadDepenses(); 
                toast.success('Dépense enregistrée');
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Graphique par catégorie */}
      {barData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => FinancesWorkflows.formatMontant(value as number)} />
                <Bar dataKey="montant" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Liste détaillée */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Moyen</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depenses.details.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{FinancesWorkflows.formatDate(d.date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {d.categorie?.icon} {d.categorie?.nom}
                    </Badge>
                  </TableCell>
                  <TableCell>{d.description}</TableCell>
                  <TableCell>{d.fournisseur || '-'}</TableCell>
                  <TableCell>{d.moyen_paiement}</TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    {FinancesWorkflows.formatMontant(d.montant)}
                  </TableCell>
                </TableRow>
              ))}
              {depenses.details.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune dépense sur cette période
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// ONGLET 4 : IMPAYÉS
// ============================================

function OngletImpayees() {
  const { hotel } = useHotel();
  const [impayees, setImpayees] = useState<{
    total: number;
    nombre: number;
    liste: Impaye[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImpayees();
  }, []);

  async function loadImpayees() {
    setLoading(true);
    try {
      const data = await FinancesWorkflows.getImpayes();
      setImpayees(data);
    } catch (error) {
      console.error('Error loading impayees:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRelance(impaye: Impaye) {
    if (!hotel?.id) return;
    
    const result = await FinancesWorkflows.creerRelance(hotel.id, {
      compte_client_id: impaye.compte_id,
      client_id: impaye.client_id,
      type_relance: 'Appel',
      montant_du: impaye.montant_du,
      message: 'Relance téléphonique',
    });

    if (result.success) {
      toast.success('Relance enregistrée');
      loadImpayees();
    } else {
      toast.error('Erreur: ' + result.error);
    }
  }

  if (loading || !impayees) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total impayés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">
              {FinancesWorkflows.formatMontant(impayees.total)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nombre de clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {impayees.nombre}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des impayés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Chambre</TableHead>
                <TableHead className="text-right">Montant dû</TableHead>
                <TableHead>Depuis</TableHead>
                <TableHead>Relances</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {impayees.liste.map((impaye) => (
                <TableRow key={impaye.compte_id}>
                  <TableCell className="font-medium">
                    {impaye.nom} {impaye.prenom}
                    {impaye.telephone && (
                      <div className="text-xs text-muted-foreground">{impaye.telephone}</div>
                    )}
                  </TableCell>
                  <TableCell>{impaye.numero_chambre || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    {FinancesWorkflows.formatMontant(impaye.montant_du)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={impaye.jours_dette > 30 ? 'destructive' : 'secondary'}>
                      {impaye.jours_dette} jours
                    </Badge>
                  </TableCell>
                  <TableCell>{impaye.nb_relances}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleRelance(impaye)}>
                        <Phone className="w-4 h-4 mr-1" />
                        Relancer
                      </Button>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Payé
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {impayees.liste.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucun impayé 🎉
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// ONGLET 5 : TRÉSORERIE
// ============================================

function OngletTresorerie() {
  const { hotel } = useHotel();
  const [solde, setSolde] = useState<{ caisse: number; banque: number; total: number } | null>(null);
  const [mouvements, setMouvements] = useState<MouvementTresorerie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hotel?.id) {
      loadTresorerie();
    }
  }, [hotel?.id]);

  async function loadTresorerie() {
    if (!hotel?.id) return;
    setLoading(true);
    try {
      const soldeData = await FinancesWorkflows.getSoldeTresorerie(hotel.id);
      const today = FinancesWorkflows.getDateRange('jour').debut;
      const mouvementsData = await FinancesWorkflows.getMouvementsJour(today);
      
      setSolde(soldeData);
      setMouvements(mouvementsData);
    } catch (error) {
      console.error('Error loading tresorerie:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !solde) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Soldes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Caisse (espèces)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {FinancesWorkflows.formatMontant(solde.caisse)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5" />
              Banque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {FinancesWorkflows.formatMontant(solde.banque)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Total disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {FinancesWorkflows.formatMontant(solde.total)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mouvements du jour */}
      <Card>
        <CardHeader>
          <CardTitle>Mouvements d'aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Compte</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mouvements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {m.type === 'Entrée' ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <ArrowUpCircle className="w-3 h-3 mr-1" />
                        Entrée
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        <ArrowDownCircle className="w-3 h-3 mr-1" />
                        Sortie
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{m.compte}</TableCell>
                  <TableCell>{m.categorie}</TableCell>
                  <TableCell>{m.description}</TableCell>
                  <TableCell className={`text-right font-bold ${m.type === 'Entrée' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.type === 'Entrée' ? '+' : '-'}{FinancesWorkflows.formatMontant(m.montant)}
                  </TableCell>
                </TableRow>
              ))}
              {mouvements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucun mouvement aujourd'hui
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// COMPOSANTS UTILITAIRES
// ============================================

function KPICard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  isPercentage = false 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  color: string;
  subtitle?: string;
  isPercentage?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isPercentage ? value : FinancesWorkflows.formatMontant(typeof value === 'number' ? value : parseFloat(value as string))}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ============================================
// FORMULAIRE NOUVELLE DÉPENSE
// ============================================

function FormulaireDepense({ hotelId, onSuccess }: { hotelId: string; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    categorie_id: '',
    montant: '',
    description: '',
    fournisseur: '',
    numero_facture: '',
    moyen_paiement: 'Espèces',
    note: '',
  });

  const [categories, setCategories] = useState<CategorieDepense[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await FinancesWorkflows.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hotelId) {
      toast.error('Hôtel non configuré');
      return;
    }
    
    setSubmitting(true);
    const result = await FinancesWorkflows.creerDepense(hotelId, {
      ...formData,
      montant: parseFloat(formData.montant),
    });
    setSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      toast.error('Erreur : ' + result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Nouvelle dépense</DialogTitle>
        <DialogDescription>Enregistrer une nouvelle dépense</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Catégorie</Label>
          <Select value={formData.categorie_id} onValueChange={(v) => setFormData({ ...formData, categorie_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Montant (Ar)</Label>
        <Input
          type="number"
          value={formData.montant}
          onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
          placeholder="50000"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Achat de produits d'entretien"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fournisseur (optionnel)</Label>
          <Input
            value={formData.fournisseur}
            onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
            placeholder="Nom du fournisseur"
          />
        </div>

        <div>
          <Label>N° Facture (optionnel)</Label>
          <Input
            value={formData.numero_facture}
            onChange={(e) => setFormData({ ...formData, numero_facture: e.target.value })}
            placeholder="FAC-2024-001"
          />
        </div>
      </div>

      <div>
        <Label>Moyen de paiement</Label>
        <Select value={formData.moyen_paiement} onValueChange={(v) => setFormData({ ...formData, moyen_paiement: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Espèces">💵 Espèces</SelectItem>
            <SelectItem value="Carte Bancaire">💳 Carte Bancaire</SelectItem>
            <SelectItem value="Chèque">📝 Chèque</SelectItem>
            <SelectItem value="Virement">🏦 Virement</SelectItem>
            <SelectItem value="Mobile Money">📱 Mobile Money</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Note (optionnel)</Label>
        <Textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="Remarques..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement...' : '✅ Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
