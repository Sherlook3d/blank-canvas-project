// ============================================
// 💰 WORKFLOWS FINANCIERS - HOTELMANAGER
// Fonctions de calcul, exports et utilitaires
// ============================================

import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// TYPES
// ============================================

export interface Recette {
  id: string;
  date: string;
  montant: number;
  moyen_paiement: string;
  categorie: string;
  client_nom: string;
  client_prenom: string;
}

export interface Depense {
  id: string;
  date: string;
  montant: number;
  categorie_id: string;
  description: string;
  fournisseur?: string;
  numero_facture?: string;
  moyen_paiement: string;
  categorie?: {
    nom: string;
    icon: string;
    couleur: string;
  };
}

export interface CategorieDepense {
  id: string;
  nom: string;
  icon: string;
  couleur: string;
}

export interface Impaye {
  compte_id: string;
  client_id: string;
  nom: string;
  prenom: string;
  montant_du: number;
  jours_dette: number;
  nb_relances: number;
  derniere_relance?: string;
  numero_chambre?: string;
  telephone?: string;
  email?: string;
}

export interface MouvementTresorerie {
  id: string;
  date: string;
  type: 'Entrée' | 'Sortie';
  montant: number;
  compte: 'Caisse' | 'Banque';
  categorie: string;
  description: string;
}

export interface KPI {
  recettes: number;
  depenses: number;
  benefice: number;
  impayees: number;
  revpar: number;
  taux_occupation: number;
}

export type Periode = 'jour' | 'semaine' | 'mois';

// ============================================
// UTILITAIRES DATE
// ============================================

export function getDateRange(periode: Periode, date: Date = new Date()): { debut: string; fin: string } {
  let debut: Date;
  let fin: Date;

  switch (periode) {
    case 'jour':
      debut = date;
      fin = date;
      break;
    case 'semaine':
      debut = startOfWeek(date, { weekStartsOn: 1 });
      fin = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case 'mois':
      debut = startOfMonth(date);
      fin = endOfMonth(date);
      break;
  }

  return {
    debut: format(debut, 'yyyy-MM-dd'),
    fin: format(fin, 'yyyy-MM-dd'),
  };
}

export function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant) + ' Ar';
}

export function formatDate(date: string): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: fr });
}

// ============================================
// CALCULS RECETTES (depuis paiements_compte)
// ============================================

export async function getRecettesPeriode(debut: string, fin: string): Promise<{
  total: number;
  par_categorie: Record<string, number>;
  par_moyen: Record<string, number>;
  details: Recette[];
}> {
  // Get payments with client info
  const { data, error } = await supabase
    .from('paiements_compte')
    .select(`
      id,
      date_paiement,
      montant,
      methode,
      compte:comptes_clients(
        id,
        client:clients(first_name, last_name)
      )
    `)
    .gte('date_paiement', debut)
    .lte('date_paiement', fin)
    .order('date_paiement', { ascending: false });

  if (error) throw error;

  const recettes = (data || []).map(p => ({
    id: p.id,
    date: p.date_paiement || '',
    montant: p.montant || 0,
    moyen_paiement: p.methode || 'Autre',
    categorie: 'Hébergement',
    client_nom: (p.compte as any)?.client?.last_name || '',
    client_prenom: (p.compte as any)?.client?.first_name || '',
  }));
  
  const total = recettes.reduce((sum, r) => sum + (r.montant || 0), 0);

  const par_categorie: Record<string, number> = {};
  recettes.forEach(r => {
    par_categorie[r.categorie] = (par_categorie[r.categorie] || 0) + r.montant;
  });

  const par_moyen: Record<string, number> = {};
  recettes.forEach(r => {
    par_moyen[r.moyen_paiement] = (par_moyen[r.moyen_paiement] || 0) + r.montant;
  });

  return {
    total,
    par_categorie,
    par_moyen,
    details: recettes,
  };
}

// ============================================
// CALCULS DÉPENSES
// ============================================

export async function getDepensesPeriode(debut: string, fin: string): Promise<{
  total: number;
  par_categorie: Record<string, number>;
  details: Depense[];
}> {
  const { data: depenses, error: errorDepenses } = await supabase
    .from('depenses')
    .select(`
      *,
      categorie:categories_depenses(nom, icon, couleur)
    `)
    .gte('date', debut)
    .lte('date', fin)
    .order('date', { ascending: false });

  if (errorDepenses) throw errorDepenses;

  const depensesData = (depenses || []) as unknown as Depense[];
  
  const total = depensesData.reduce((sum, d) => sum + (d.montant || 0), 0);

  const par_categorie: Record<string, number> = {};
  depensesData.forEach(d => {
    const catName = d.categorie?.nom || 'Autres';
    par_categorie[catName] = (par_categorie[catName] || 0) + d.montant;
  });

  return {
    total,
    par_categorie,
    details: depensesData,
  };
}

// ============================================
// GET CATEGORIES
// ============================================

export async function getCategories(): Promise<CategorieDepense[]> {
  const { data, error } = await supabase
    .from('categories_depenses')
    .select('*')
    .eq('actif', true)
    .order('ordre');

  if (error) throw error;
  return (data || []) as unknown as CategorieDepense[];
}

// ============================================
// CALCULS IMPAYÉS
// ============================================

export async function getImpayes(): Promise<{
  total: number;
  nombre: number;
  liste: Impaye[];
}> {
  // Get accounts with positive balance (dette)
  const { data, error } = await supabase
    .from('comptes_clients')
    .select(`
      id,
      solde,
      date_ouverture,
      client:clients(id, first_name, last_name, phone, email),
      reservation:reservations(room:rooms(number))
    `)
    .gt('solde', 0)
    .order('date_ouverture', { ascending: true });

  if (error) throw error;

  // Get relances count for each compte
  const compteIds = (data || []).map(c => c.id);
  const { data: relances } = await supabase
    .from('relances_impayees')
    .select('compte_client_id, date_relance')
    .in('compte_client_id', compteIds);

  const relancesMap: Record<string, { count: number; last: string | null }> = {};
  (relances || []).forEach(r => {
    if (!relancesMap[r.compte_client_id]) {
      relancesMap[r.compte_client_id] = { count: 0, last: null };
    }
    relancesMap[r.compte_client_id].count++;
    if (!relancesMap[r.compte_client_id].last || r.date_relance > relancesMap[r.compte_client_id].last!) {
      relancesMap[r.compte_client_id].last = r.date_relance;
    }
  });

  const liste: Impaye[] = (data || []).map(compte => {
    const client = compte.client as any;
    const reservation = compte.reservation as any;
    const dateOuverture = new Date(compte.date_ouverture || new Date());
    const joursDepuis = Math.floor((Date.now() - dateOuverture.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      compte_id: compte.id,
      client_id: client?.id || '',
      nom: client?.last_name || '',
      prenom: client?.first_name || '',
      montant_du: compte.solde || 0,
      jours_dette: joursDepuis,
      nb_relances: relancesMap[compte.id]?.count || 0,
      derniere_relance: relancesMap[compte.id]?.last || undefined,
      numero_chambre: reservation?.room?.number || undefined,
      telephone: client?.phone || undefined,
      email: client?.email || undefined,
    };
  });

  const total = liste.reduce((sum, i) => sum + (i.montant_du || 0), 0);

  return {
    total,
    nombre: liste.length,
    liste,
  };
}

// ============================================
// CALCULS TRÉSORERIE
// ============================================

export async function getSoldeTresorerie(hotelId: string): Promise<{
  caisse: number;
  banque: number;
  total: number;
}> {
  const { data, error } = await supabase
    .rpc('calculer_solde_tresorerie', {
      p_hotel_id: hotelId,
      p_date: format(new Date(), 'yyyy-MM-dd'),
    });

  if (error) {
    console.error('Error calculating treasury:', error);
    return { caisse: 0, banque: 0, total: 0 };
  }

  const result = data?.[0];
  return {
    caisse: result?.solde_caisse || 0,
    banque: result?.solde_banque || 0,
    total: result?.solde_total || 0,
  };
}

export async function getMouvementsJour(date: string): Promise<MouvementTresorerie[]> {
  const { data, error } = await supabase
    .from('mouvements_tresorerie')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []) as unknown as MouvementTresorerie[];
}

// ============================================
// CALCULS KPIs
// ============================================

export async function getKPIs(periode: Periode = 'mois'): Promise<KPI> {
  const { debut, fin } = getDateRange(periode);

  const { total: recettes } = await getRecettesPeriode(debut, fin);
  const { total: depenses } = await getDepensesPeriode(debut, fin);
  const { total: impayees } = await getImpayes();

  // Get rooms count
  const { data: chambres } = await supabase
    .from('rooms')
    .select('id');
  
  const nbChambres = chambres?.length || 1;
  const nbJours = periode === 'jour' ? 1 : periode === 'semaine' ? 7 : 30;
  const revpar = recettes / (nbChambres * nbJours);

  // Occupancy rate
  const { data: reservations } = await supabase
    .from('reservations')
    .select('id')
    .eq('status', 'checked_in')
    .gte('check_in', debut)
    .lte('check_in', fin);

  const nbReservations = reservations?.length || 0;
  const taux_occupation = Math.min((nbReservations / nbChambres) * 100, 100);

  return {
    recettes,
    depenses,
    benefice: recettes - depenses,
    impayees,
    revpar,
    taux_occupation,
  };
}

// ============================================
// ÉVOLUTION 6 MOIS
// ============================================

export async function getEvolution6Mois(): Promise<{
  labels: string[];
  recettes: number[];
  depenses: number[];
}> {
  const labels: string[] = [];
  const recettes: number[] = [];
  const depenses: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const mois = subMonths(new Date(), i);
    const { debut, fin } = getDateRange('mois', mois);
    const label = format(mois, 'MMM yyyy', { locale: fr });

    const { total: r } = await getRecettesPeriode(debut, fin);
    const { total: d } = await getDepensesPeriode(debut, fin);

    labels.push(label);
    recettes.push(r);
    depenses.push(d);
  }

  return { labels, recettes, depenses };
}

// ============================================
// CRÉATION DÉPENSE
// ============================================

export async function creerDepense(hotelId: string, depense: {
  date: string;
  categorie_id: string;
  montant: number;
  description: string;
  fournisseur?: string;
  numero_facture?: string;
  moyen_paiement: string;
  note?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('depenses')
    .insert([{ ...depense, hotel_id: hotelId }]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// RELANCER IMPAYÉ
// ============================================

export async function creerRelance(hotelId: string, relance: {
  compte_client_id: string;
  client_id: string;
  type_relance: string;
  montant_du: number;
  message?: string;
  note?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('relances_impayees')
    .insert([{
      ...relance,
      hotel_id: hotelId,
      date_relance: format(new Date(), 'yyyy-MM-dd'),
    }]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// EXPORT PDF
// ============================================

export async function exporterBilanPDF(
  periode: Periode,
  date: Date = new Date()
): Promise<void> {
  const { debut, fin } = getDateRange(periode, date);
  
  const { total: recettes, par_categorie: recettesCateg } = await getRecettesPeriode(debut, fin);
  const { total: depenses, par_categorie: depensesCateg } = await getDepensesPeriode(debut, fin);
  const benefice = recettes - depenses;

  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BILAN FINANCIER', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Période : ${formatDate(debut)} - ${formatDate(fin)}`, 105, 30, { align: 'center' });

  // KPIs
  let y = 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ', 20, y);

  y += 10;

  const kpisData = [
    ['Recettes totales', formatMontant(recettes)],
    ['Dépenses totales', formatMontant(depenses)],
    ['Bénéfice', formatMontant(benefice)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Indicateur', 'Montant']],
    body: kpisData,
    theme: 'grid',
  });

  // Recettes par catégorie
  y = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECETTES PAR CATÉGORIE', 20, y);

  y += 5;
  const recettesData = Object.entries(recettesCateg).map(([cat, montant]) => [
    cat,
    formatMontant(montant as number),
  ]);

  if (recettesData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Catégorie', 'Montant']],
      body: recettesData,
      theme: 'grid',
    });
  }

  // Dépenses par catégorie
  y = (doc as any).lastAutoTable?.finalY + 15 || y + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉPENSES PAR CATÉGORIE', 20, y);

  y += 5;
  const depensesData = Object.entries(depensesCateg).map(([cat, montant]) => [
    cat,
    formatMontant(montant as number),
  ]);

  if (depensesData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Catégorie', 'Montant']],
      body: depensesData,
      theme: 'grid',
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(9);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} / ${pageCount} - Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`,
      105,
      290,
      { align: 'center' }
    );
  }

  const filename = `bilan_${periode}_${format(date, 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

// ============================================
// EXPORT EXCEL
// ============================================

export async function exporterBilanExcel(
  periode: Periode,
  date: Date = new Date()
): Promise<void> {
  const { debut, fin } = getDateRange(periode, date);

  const { details: recettes, total: totalRecettes } = await getRecettesPeriode(debut, fin);
  const { details: depenses, total: totalDepenses } = await getDepensesPeriode(debut, fin);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const resumeData = [
    ['BILAN FINANCIER'],
    [`Période : ${formatDate(debut)} - ${formatDate(fin)}`],
    [],
    ['Recettes totales', totalRecettes],
    ['Dépenses totales', totalDepenses],
    ['Bénéfice', totalRecettes - totalDepenses],
  ];
  const wsResume = XLSX.utils.aoa_to_sheet(resumeData);
  XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé');

  // Sheet 2: Recettes
  const recettesData = recettes.map(r => ({
    Date: formatDate(r.date),
    Client: `${r.client_nom} ${r.client_prenom}`,
    Catégorie: r.categorie,
    'Moyen paiement': r.moyen_paiement,
    Montant: r.montant,
  }));
  const wsRecettes = XLSX.utils.json_to_sheet(recettesData);
  XLSX.utils.book_append_sheet(wb, wsRecettes, 'Recettes');

  // Sheet 3: Dépenses
  const depensesData = depenses.map(d => ({
    Date: formatDate(d.date),
    Catégorie: d.categorie?.nom || 'Autre',
    Description: d.description,
    Fournisseur: d.fournisseur || '-',
    'Moyen paiement': d.moyen_paiement,
    Montant: d.montant,
  }));
  const wsDepenses = XLSX.utils.json_to_sheet(depensesData);
  XLSX.utils.book_append_sheet(wb, wsDepenses, 'Dépenses');

  const filename = `bilan_${periode}_${format(date, 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ============================================
// EXPORT DEFAULT
// ============================================

const FinancesWorkflows = {
  getDateRange,
  formatMontant,
  formatDate,
  getRecettesPeriode,
  getDepensesPeriode,
  getCategories,
  getImpayes,
  creerDepense,
  creerRelance,
  getSoldeTresorerie,
  getMouvementsJour,
  getKPIs,
  getEvolution6Mois,
  exporterBilanPDF,
  exporterBilanExcel,
};

export default FinancesWorkflows;
