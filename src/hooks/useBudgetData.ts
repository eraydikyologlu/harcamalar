import { useState, useEffect, useCallback } from 'react';
import { Transaction, MonthlyData } from '../components/BudgetTracker';

const STORAGE_KEY = 'monthlyBudgetData';

export const useBudgetData = () => {
  const [monthlyTransactions, setMonthlyTransactions] = useState<MonthlyData>({});

  // LocalStorage'dan veri yükleme ve migration
  useEffect(() => {
    try {
      // Yeni format kontrolü
      const newData = localStorage.getItem(STORAGE_KEY);
      if (newData) {
        setMonthlyTransactions(JSON.parse(newData));
        return;
      }

      // Eski format migration (mevcut verileri koruma)
      const oldData = localStorage.getItem('transactions');
      if (oldData) {
        const oldTransactions = JSON.parse(oldData);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const migratedData = { [currentMonth]: oldTransactions };
        
        setMonthlyTransactions(migratedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
        localStorage.removeItem('transactions'); // Eski formatı temizle
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setMonthlyTransactions({});
    }
  }, []);

  // LocalStorage'a kaydetme
  const saveToStorage = useCallback((data: MonthlyData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
  }, []);

  // İşlem ekleme
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const month = transaction.date.slice(0, 7); // YYYY-MM format
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    setMonthlyTransactions(prev => {
      const updated = {
        ...prev,
        [month]: [...(prev[month] || []), newTransaction]
      };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // İşlem silme
  const deleteTransaction = useCallback((id: string) => {
    setMonthlyTransactions(prev => {
      const updated = { ...prev };
      
      // Hangi ayda bu ID'ye sahip işlem var?
      for (const month in updated) {
        updated[month] = updated[month].filter(t => t.id !== id);
        // Eğer ay boş kaldıysa, ayı da sil
        if (updated[month].length === 0) {
          delete updated[month];
        }
      }
      
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Belirli ay verilerini getirme
  const getMonthData = useCallback((month: string): Transaction[] => {
    return monthlyTransactions[month] || [];
  }, [monthlyTransactions]);

  // Tüm ayları getirme (sıralı)
  const getAllMonths = useCallback((): string[] => {
    return Object.keys(monthlyTransactions).sort((a, b) => b.localeCompare(a));
  }, [monthlyTransactions]);

  // Aylık istatistikler
  const getMonthlyStats = useCallback((month: string) => {
    const transactions = monthlyTransactions[month] || [];
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  }, [monthlyTransactions]);

  return {
    monthlyTransactions,
    addTransaction,
    deleteTransaction,
    getMonthData,
    getAllMonths,
    getMonthlyStats
  };
};