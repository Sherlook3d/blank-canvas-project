import { useState, useMemo } from 'react';
import { Search, Eye, Plus, CreditCard, AlertTriangle, Wallet, Users, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useComptes, CompteClient, LigneType, MethodePaiement, formatMontant } from '@/hooks/useComptes';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import { CompteDetailsDialog } from '@/components/comptes/CompteDetailsDialog';
import { AjouterConsommationDialog } from '@/components/comptes/AjouterConsommationDialog';
import { EncaisserDialog } from '@/components/comptes/EncaisserDialog';

type FilterStatus = 'all' | 'Ouvert' | 'Dette';

const Comptes = () => {
  const { formatCurrency } = useCurrency();
  const { comptes, comptesOuverts, isLoading, getStats, ajouterConsommation, encaisserPaiement, refreshComptes } = useComptes();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [selectedCompte, setSelectedCompte] = useState<CompteClient | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddConsommation, setShowAddConsommation] = useState(false);
  const [showEncaisser, setShowEncaisser] = useState(false);

  const stats = getStats();

  const filteredComptes = useMemo(() => {
    return comptesOuverts.filter((compte) => {
      const clientName = `${compte.client?.first_name || ''} ${compte.client?.last_name || ''}`.toLowerCase();
      const roomNumber = compte.reservation?.room?.number || '';
      const numero = compte.numero || '';
      
      const matchesSearch = 
        clientName.includes(searchQuery.toLowerCase()) ||
        roomNumber.includes(searchQuery) ||
        numero.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = activeFilter === 'all' || compte.statut === activeFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [comptesOuverts, searchQuery, activeFilter]);

  const handleViewDetails = (compte: CompteClient) => {
    setSelectedCompte(compte);
    setShowDetails(true);
  };

  const handleAddConsommation = (compte: CompteClient) => {
    setSelectedCompte(compte);
    setShowAddConsommation(true);
  };

  const handleEncaisser = (compte: CompteClient) => {
    setSelectedCompte(compte);
    setShowEncaisser(true);
  };

  const handleConfirmConsommation = async (type: LigneType, montant: number, description?: string) => {
    if (!selectedCompte) return false;
    const success = await ajouterConsommation(selectedCompte.id, type, montant, description);
    if (success) {
      await refreshComptes();
    }
    return success;
  };

  const handleConfirmPaiement = async (montant: number, methode: MethodePaiement, reference?: string) => {
    if (!selectedCompte) return false;
    const success = await encaisserPaiement(selectedCompte.id, montant, methode, reference);
    if (success) {
      await refreshComptes();
    }
    return success;
  };

  const handleDetailsClose = (open: boolean) => {
    setShowDetails(open);
    if (!open) {
      refreshComptes();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dialogs */}
      <CompteDetailsDialog
        compte={selectedCompte}
        open={showDetails}
        onOpenChange={handleDetailsClose}
        onAddConsommation={() => {
          setShowDetails(false);
          setShowAddConsommation(true);
        }}
        onEncaisser={() => {
          setShowDetails(false);
          setShowEncaisser(true);
        }}
      />

      <AjouterConsommationDialog
        open={showAddConsommation}
        onOpenChange={setShowAddConsommation}
        onConfirm={handleConfirmConsommation}
        clientName={selectedCompte ? `${selectedCompte.client?.first_name} ${selectedCompte.client?.last_name}` : undefined}
        chambreNum={selectedCompte?.reservation?.room?.number}
      />

      <EncaisserDialog
        open={showEncaisser}
        onOpenChange={setShowEncaisser}
        onConfirm={handleConfirmPaiement}
        soldeRestant={selectedCompte?.solde || 0}
        clientName={selectedCompte ? `${selectedCompte.client?.first_name} ${selectedCompte.client?.last_name}` : undefined}
        chambreNum={selectedCompte?.reservation?.room?.number}
      />

      <PageHeader 
        title="💰 Comptes Clients"
        subtitle={`${stats.nbComptesOuverts} comptes ouverts • ${formatCurrency(stats.totalARecevoir)} à recevoir`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <KpiCard
          icon={Users}
          iconColor="blue"
          title="En chambre"
          value={stats.nbComptesOuverts}
          subtitle="comptes actifs"
        />
        <KpiCard
          icon={AlertTriangle}
          iconColor="orange"
          title="À recevoir"
          value={formatCurrency(stats.totalARecevoir)}
          subtitle="soldes restants"
        />
        <KpiCard
          icon={Wallet}
          iconColor="green"
          title="Total facturé"
          value={formatCurrency(stats.totalEnCours)}
          subtitle="en cours"
        />
      </div>

      {/* Search and Filters */}
      <div className="gravity-card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, chambre ou numéro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all' as FilterStatus, label: 'Tous' },
              { value: 'Ouvert' as FilterStatus, label: 'Ouverts' },
              { value: 'Dette' as FilterStatus, label: '⚠️ Dettes' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'filter-pill',
                  activeFilter === filter.value && 'filter-pill-active'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comptes List */}
      <div className="space-y-4">
        {filteredComptes.length === 0 ? (
          <div className="gravity-card flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-foreground mb-1">Aucun compte trouvé</h3>
            <p className="text-sm text-muted-foreground">
              {comptesOuverts.length === 0 
                ? "Aucun compte client ouvert pour le moment" 
                : "Essayez de modifier vos filtres"}
            </p>
          </div>
        ) : (
          filteredComptes.map((compte) => (
            <div key={compte.id} className="gravity-card">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                    {compte.client?.first_name?.[0]}{compte.client?.last_name?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {compte.client?.first_name} {compte.client?.last_name}
                      </h3>
                      {compte.reservation?.room && (
                        <span className="px-2 py-0.5 text-xs bg-muted rounded-full flex items-center gap-1">
                          <BedDouble className="w-3 h-3" />
                          {compte.reservation.room.number}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{compte.numero}</p>
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  compte.statut === 'Soldé' ? 'bg-success/15 text-success' : 
                  compte.statut === 'Dette' ? 'bg-destructive/15 text-destructive' : 
                  'bg-warning/15 text-warning'
                )}>
                  {compte.statut}
                </span>
              </div>

              {/* Montants */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Facturé</p>
                  <p className="font-semibold text-foreground">{formatMontant(compte.total_facture)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Payé</p>
                  <p className="font-semibold text-success">{formatMontant(compte.total_paye)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Solde</p>
                  <p className={cn(
                    'font-bold text-lg',
                    compte.solde > 0 ? 'text-warning' : 'text-success'
                  )}>
                    {formatMontant(compte.solde)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1.5"
                  onClick={() => handleAddConsommation(compte)}
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 gap-1.5 bg-accent hover:bg-accent/90"
                  onClick={() => handleEncaisser(compte)}
                  disabled={compte.solde <= 0}
                >
                  <CreditCard className="w-4 h-4" />
                  Encaisser
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(compte)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comptes;
