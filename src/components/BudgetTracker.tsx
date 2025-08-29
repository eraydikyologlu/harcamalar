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

  const {
    monthlyTransactions,
    addTransaction,
    deleteTransaction,
    getAllMonths,
    getMonthData,
    getMonthlyStats
  } = useBudgetData();

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedMonth={selectedMonth}
        onMonthSelect={setSelectedMonth}
        monthlyTransactions={monthlyTransactions}
        getMonthlyStats={getMonthlyStats}
      />
      
      <main className="flex-1 min-h-screen">
        {currentPage === 'dashboard' ? (
          <Dashboard 
            selectedMonth={selectedMonth}
            transactions={getMonthData(selectedMonth)}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            monthlyStats={getMonthlyStats(selectedMonth)}
          />
        ) : (
          <Analytics
            monthlyTransactions={monthlyTransactions}
            allMonths={getAllMonths()}
            getMonthlyStats={getMonthlyStats}
          />
        )}
      </main>
    </div>
  );
};