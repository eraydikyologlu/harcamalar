import { BarChart3, PieChart, Calendar } from 'lucide-react';
import { MonthlyData, PageType } from './BudgetTracker';
import { formatCurrency, getMonthName } from '../utils/formatters';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
  monthlyTransactions: MonthlyData;
  getMonthlyStats: (month: string) => {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
  };
}

export const Sidebar = ({
  currentPage,
  onPageChange,
  selectedMonth,
  onMonthSelect,
  monthlyTransactions,
  getMonthlyStats
}: SidebarProps) => {
  const allMonths = Object.keys(monthlyTransactions)
    .sort((a, b) => b.localeCompare(a)); // En yeni en üstte

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-gradient-primary">
          💰 Bütçe Takip
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kişisel finans yönetiminiz
        </p>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-sidebar-border">
        <nav className="space-y-2">
          <button
            onClick={() => onPageChange('dashboard')}
            className={`sidebar-item w-full ${currentPage === 'dashboard' ? 'active' : ''}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">📊 Ana Sayfa</span>
          </button>
          
          <button
            onClick={() => onPageChange('analytics')}
            className={`sidebar-item w-full ${currentPage === 'analytics' ? 'active' : ''}`}
          >
            <PieChart className="w-5 h-5" />
            <span className="font-medium">📈 Analitik</span>
          </button>
        </nav>
      </div>

      {/* Monthly History */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h3 className="font-semibold text-sidebar-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Geçmiş Aylar
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {allMonths.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Henüz işlem yok</p>
              <p className="text-sm">İlk işleminizi ekleyin</p>
            </div>
          ) : (
            allMonths.map((month) => {
              const stats = getMonthlyStats(month);
              const isActive = month === selectedMonth;
              
              return (
                <button
                  key={month}
                  onClick={() => onMonthSelect(month)}
                  className={`w-full p-4 rounded-lg border text-left transition-all duration-200 hover:shadow-lg ${
                    isActive 
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg border-l-4' 
                      : 'bg-card border-border hover:border-primary/30 hover:bg-card/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">
                      {getMonthName(month)}
                    </h4>
                    <span className="text-xs opacity-75">
                      {stats.transactionCount} işlem
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-success">Gelir:</span>
                      <span className="font-medium">
                        {formatCurrency(stats.totalIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-destructive">Gider:</span>
                      <span className="font-medium">
                        {formatCurrency(stats.totalExpenses)}
                      </span>
                    </div>
                    <hr className={`my-2 ${isActive ? 'border-primary-foreground/20' : 'border-border'}`} />
                    <div className="flex justify-between font-semibold">
                      <span>Bakiye:</span>
                      <span className={stats.balance >= 0 ? 'text-success' : 'text-destructive'}>
                        {formatCurrency(stats.balance)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};