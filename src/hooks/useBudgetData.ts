import { useState, useEffect, useCallback } from 'react';
import { Transaction, MonthlyData } from '../components/BudgetTracker';
import { categorizeTransaction } from '../utils/categories';

const STORAGE_KEY = 'monthlyBudgetData';

export const useBudgetData = () => {
  const [monthlyTransactions, setMonthlyTransactions] = useState<MonthlyData>({});

  // LocalStorage'dan veri yükleme ve migration
  useEffect(() => {
    try {
      // Yeni format kontrolü
      const newData = localStorage.getItem(STORAGE_KEY);
      if (newData) {
        let data = JSON.parse(newData);
        let needsUpdate = false;

        // isPaid field migration - mevcut işlemlere isPaid=true ekle
        for (const month in data) {
          data[month] = data[month].map((transaction: any) => {
            if (transaction.isPaid === undefined) {
              needsUpdate = true;
              return { ...transaction, isPaid: true };
            }
            return transaction;
          });
        }

        if (needsUpdate) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          console.log('Payment status migration completed!');
        }

        setMonthlyTransactions(data);
        return;
      }

      // Eski format migration (mevcut verileri koruma)
      const oldData = localStorage.getItem('transactions');
      if (oldData) {
        const oldTransactions = JSON.parse(oldData);
        const currentMonth = new Date().toISOString().slice(0, 7);
        // Eski işlemlere de isPaid=true ekle
        const transactionsWithPaymentStatus = oldTransactions.map((t: any) => ({
          ...t,
          isPaid: true
        }));
        const migratedData = { [currentMonth]: transactionsWithPaymentStatus };
        
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
    
    // Tüm işlemler için hesaplama (isPaid durumuna bakmaksızın)
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Kalan borç - sadece ödenecek olan giderler
    const remainingDebt = transactions
      .filter(t => t.type === 'expense' && t.isPaid === false)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      remainingDebt,
      balance: totalIncome - totalExpenses,
      spendingRatio: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
      transactionCount: transactions.length
    };
  }, [monthlyTransactions]);

  // Mevcut tüm işlemleri yeniden sınıflandırma
  const recategorizeAllTransactions = useCallback(() => {
    setMonthlyTransactions(prev => {
      const updated = { ...prev };
      let updateCount = 0;
      
      // Her ay için işlemleri yeniden sınıflandır
      for (const month in updated) {
        updated[month] = updated[month].map(transaction => {
          const newCategory = categorizeTransaction(transaction.description);
          if (transaction.category !== newCategory) {
            updateCount++;
            return { ...transaction, category: newCategory };
          }
          return transaction;
        });
      }
      
      if (updateCount > 0) {
        saveToStorage(updated);
        console.log(`${updateCount} işlem yeniden sınıflandırıldı!`);
      }
      
      return updated;
    });
  }, [saveToStorage]);

  // Ödeme durumunu güncelleme
  const updatePaymentStatus = useCallback((id: string, isPaid: boolean) => {
    setMonthlyTransactions(prev => {
      const updated = { ...prev };
      
      // Hangi ayda bu ID'ye sahip işlem var?
      for (const month in updated) {
        updated[month] = updated[month].map(t => 
          t.id === id ? { ...t, isPaid } : t
        );
      }
      
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Tüm işlemleri ödenecek durumuna getirme
  const markAllAsPending = useCallback(() => {
    setMonthlyTransactions(prev => {
      const updated = { ...prev };
      let updateCount = 0;
      
      // Her ay için işlemleri ödenecek yap
      for (const month in updated) {
        updated[month] = updated[month].map(transaction => {
          if (transaction.type === 'expense' && transaction.isPaid !== false) {
            updateCount++;
            return { ...transaction, isPaid: false };
          }
          return transaction;
        });
      }
      
      if (updateCount > 0) {
        saveToStorage(updated);
        console.log(`${updateCount} gider işlemi ödenecek durumuna getirildi!`);
      }
      
      return updated;
    });
  }, [saveToStorage]);

  return {
    monthlyTransactions,
    addTransaction,
    deleteTransaction,
    getMonthData,
    getAllMonths,
    getMonthlyStats,
    recategorizeAllTransactions,
    updatePaymentStatus,
    markAllAsPending
  };
};