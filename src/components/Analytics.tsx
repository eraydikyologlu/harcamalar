import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Wallet, Calendar, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonthlyData } from './BudgetTracker';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { getCategoryColor, getCategoryIcon } from '../utils/categories';

// Chart.js kayıt
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsProps {
  monthlyTransactions: MonthlyData;
  allMonths: string[];
  onToggleSidebar?: () => void;
  getMonthlyStats: (month: string) => {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
  };
}

export const Analytics = ({
  monthlyTransactions,
  allMonths,
  onToggleSidebar,
  getMonthlyStats
}: AnalyticsProps) => {
  // Genel istatistikler
  const overallStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransactions = 0;

    allMonths.forEach(month => {
      const stats = getMonthlyStats(month);
      totalIncome += stats.totalIncome;
      totalExpenses += stats.totalExpenses;
      totalTransactions += stats.transactionCount;
    });

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalMonths: allMonths.length,
      totalTransactions
    };
  }, [allMonths, getMonthlyStats]);

  // Aylık gelir/gider bar chart verisi
  const monthlyBarData = useMemo(() => {
    const sortedMonths = [...allMonths].sort();
    const incomeData = sortedMonths.map(month => getMonthlyStats(month).totalIncome);
    const expenseData = sortedMonths.map(month => getMonthlyStats(month).totalExpenses);

    return {
      labels: sortedMonths.map(month => getMonthName(month)),
      datasets: [
        {
          label: 'Gelir',
          data: incomeData,
          backgroundColor: 'hsl(142, 76%, 36%)',
          borderColor: 'hsl(142, 76%, 36%)',
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: 'Gider',
          data: expenseData,
          backgroundColor: 'hsl(0, 84%, 60%)',
          borderColor: 'hsl(0, 84%, 60%)', 
          borderWidth: 1,
          borderRadius: 6,
        }
      ]
    };
  }, [allMonths, getMonthlyStats]);

  // Bakiye trend line chart verisi
  const balanceTrendData = useMemo(() => {
    const sortedMonths = [...allMonths].sort();
    const balanceData = sortedMonths.map(month => getMonthlyStats(month).balance);

    return {
      labels: sortedMonths.map(month => getMonthName(month)),
      datasets: [
        {
          label: 'Net Bakiye',
          data: balanceData,
          borderColor: 'hsl(188, 100%, 50%)',
          backgroundColor: 'hsl(188, 100%, 50%, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'hsl(188, 100%, 50%)',
          pointBorderColor: 'hsl(220, 13%, 14%)',
          pointBorderWidth: 2,
          pointRadius: 6,
        }
      ]
    };
  }, [allMonths, getMonthlyStats]);

  // Kategori analizi
  const categoryAnalysis = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};

    Object.values(monthlyTransactions).forEach(transactions => {
      transactions.forEach(transaction => {
        if (transaction.type === 'expense' && transaction.category) {
          categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
        }
      });
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a);

    return {
      categories: sortedCategories,
      pieData: {
        labels: sortedCategories.map(([category]) => category),
        datasets: [
          {
            data: sortedCategories.map(([,amount]) => amount),
            backgroundColor: sortedCategories.map(([category]) => getCategoryColor(category)),
            borderColor: 'hsl(220, 13%, 14%)',
            borderWidth: 2,
          }
        ]
      }
    };
  }, [monthlyTransactions]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'hsl(210, 40%, 98%)',
          font: {
            size: 12,
            weight: 500 as const,
          }
        }
      },
      tooltip: {
        backgroundColor: 'hsl(220, 13%, 14%)',
        titleColor: 'hsl(210, 40%, 98%)',
        bodyColor: 'hsl(210, 40%, 98%)',
        borderColor: 'hsl(188, 100%, 50%)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: { color: 'hsl(215, 20.2%, 65.1%)' },
        grid: { color: 'hsl(220, 13%, 18%)' }
      },
      y: {
        ticks: { 
          color: 'hsl(215, 20.2%, 65.1%)',
          callback: (value: any) => formatCurrency(value)
        },
        grid: { color: 'hsl(220, 13%, 18%)' }
      }
    }
  };

  if (allMonths.length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="text-center py-20">
          <Wallet className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-4">Henüz Analiz Verisi Yok</h2>
          <p className="text-muted-foreground">
            Analiz görüntüleyebilmek için önce birkaç işlem ekleyin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="lg:hidden mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          📈 Finansal Analitik
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          Tüm aylardaki gelir, gider ve kategori analizleriniz
        </p>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="budget-card-success animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Gelir</p>
              <p className="text-xl font-bold text-success">
                {formatCurrency(overallStats.totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="budget-card-destructive animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Gider</p>
              <p className="text-xl font-bold text-destructive">
                {formatCurrency(overallStats.totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="budget-card-primary animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Bakiye</p>
              <p className={`text-xl font-bold ${
                overallStats.balance >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(overallStats.balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="budget-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Calendar className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Ay</p>
              <p className="text-xl font-bold text-foreground">
                {overallStats.totalMonths}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Income/Expense Bar Chart */}
        <div className="budget-card animate-slide-in">
          <h3 className="text-lg font-semibold mb-6">Aylık Gelir/Gider Karşılaştırması</h3>
          <div className="h-80">
            <Bar data={monthlyBarData} options={chartOptions} />
          </div>
        </div>

        {/* Balance Trend Line Chart */}
        <div className="budget-card animate-slide-in">
          <h3 className="text-lg font-semibold mb-6">Bakiye Trend Analizi</h3>
          <div className="h-80">
            <Line data={balanceTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Pie Chart */}
        <div className="budget-card animate-bounce-in">
          <h3 className="text-lg font-semibold mb-6">Gider Kategorileri Dağılımı</h3>
          {categoryAnalysis.categories.length > 0 ? (
            <div className="h-80">
              <Pie 
                data={categoryAnalysis.pieData} 
                options={{
                  ...chartOptions,
                  scales: undefined // Pie chart'ta scale yok
                }} 
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              <p>Henüz kategori verisi yok</p>
            </div>
          )}
        </div>

        {/* Category Details List */}
        <div className="budget-card animate-bounce-in">
          <h3 className="text-lg font-semibold mb-6">Kategori Detayları</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {categoryAnalysis.categories.length > 0 ? (
              categoryAnalysis.categories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCategoryIcon(category)}</span>
                      <span className="font-medium">{category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">
                      {formatCurrency(amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      %{((amount / overallStats.totalExpenses) * 100).toFixed(1)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Henüz kategori analizi yok</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};