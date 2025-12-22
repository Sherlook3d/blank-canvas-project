import { useState } from 'react';
import { 
  Euro, 
  TrendingUp, 
  Percent, 
  Users,
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { 
  monthlyRevenue, 
  weeklyOccupancy, 
  roomTypeDistribution,
  formatCurrency 
} from '@/data/mockData';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const Statistiques = () => {
  const [selectedYear] = useState('2025');

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const avgOccupancy = Math.round(weeklyOccupancy.reduce((sum, d) => sum + d.rate, 0) / weeklyOccupancy.length);
  const revPAR = Math.round(totalRevenue / 12 / 20); // Monthly avg / rooms

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Statistiques & Performance"
        subtitle="Analyse détaillée de votre activité hôtelière"
        actions={
          <Button variant="outline" className="gap-2">
            Année {selectedYear}
            <ChevronDown className="w-4 h-4" />
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KpiCard
          icon={Euro}
          iconColor="yellow"
          title="Revenu annuel"
          value={formatCurrency(totalRevenue)}
          subtitle="vs. année précédente"
          change={12.5}
        />
        <KpiCard
          icon={TrendingUp}
          iconColor="blue"
          title="Taux d'occupation moyen"
          value={`${avgOccupancy}%`}
          subtitle="moyenne annuelle"
          change={8}
        />
        <KpiCard
          icon={Percent}
          iconColor="green"
          title="RevPAR"
          value={formatCurrency(revPAR)}
          subtitle="revenu par chambre dispo"
          change={15}
        />
        <KpiCard
          icon={Users}
          iconColor="orange"
          title="Clients fidèles"
          value="42%"
          subtitle="taux de retour"
          change={5}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="gravity-card lg:col-span-2">
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Évolution des revenus</h3>
            <p className="text-sm text-muted-foreground">Revenus mensuels en euros</p>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(214, 32%, 91%)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px hsl(0 0% 0% / 0.07)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Type Distribution */}
        <div className="gravity-card">
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Répartition par type</h3>
            <p className="text-sm text-muted-foreground">Distribution des réservations</p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roomTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(214, 32%, 91%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Part']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-4">
            {roomTypeDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Occupation Bar Chart */}
      <div className="gravity-card">
        <div className="mb-6">
          <h3 className="font-semibold text-foreground">Occupation hebdomadaire</h3>
          <p className="text-sm text-muted-foreground">Taux d'occupation par jour de la semaine</p>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyOccupancy} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(0, 0%, 100%)', 
                  border: '1px solid hsl(214, 32%, 91%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Occupation']}
              />
              <Bar 
                dataKey="rate" 
                fill="hsl(213, 56%, 24%)" 
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistiques;
