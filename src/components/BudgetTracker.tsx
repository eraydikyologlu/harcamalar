import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { Analytics } from './Analytics';
import { useBudgetData } from '../hooks/useBudgetData';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category?: string;
  isPaid?: boolean;
}

export interface MonthlyData {
  [monthKey: string]: Transaction[];
}

export type PageType = 'dashboard' | 'analytics';

export const BudgetTracker = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7); // YYYY-MM format
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    monthlyTransactions,
    addTransaction,
    deleteTransaction,
    getAllMonths,
    getMonthData,
    getMonthlyStats,
    recategorizeAllTransactions,
    updatePaymentStatus,
    markAllAsPending
  } = useBudgetData();

  return (
    <div className="min-h-screen w-full flex bg-background relative">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedMonth={selectedMonth}
        onMonthSelect={setSelectedMonth}
        monthlyTransactions={monthlyTransactions}
        getMonthlyStats={getMonthlyStats}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="flex-1 min-h-screen lg:ml-0">
        {currentPage === 'dashboard' ? (
          <Dashboard 
            selectedMonth={selectedMonth}
            transactions={getMonthData(selectedMonth)}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            monthlyStats={getMonthlyStats(selectedMonth)}
            onRecategorizeAll={recategorizeAllTransactions}
            onUpdatePaymentStatus={updatePaymentStatus}
            onMarkAllAsPending={markAllAsPending}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <Analytics
            monthlyTransactions={monthlyTransactions}
            allMonths={getAllMonths()}
            getMonthlyStats={getMonthlyStats}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
      </main>
    </div>
  );
};