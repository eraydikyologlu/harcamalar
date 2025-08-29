import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Transaction } from './BudgetTracker';
import { formatCurrency, getMonthName, formatDate } from '../utils/formatters';
import { categorizeTransaction } from '../utils/categories';
import { toast } from '@/hooks/use-toast';

interface DashboardProps {
  selectedMonth: string;
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  monthlyStats: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
  };
}

export const Dashboard = ({
  selectedMonth,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  monthlyStats
}: DashboardProps) => {
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: ''
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTransaction.amount || !newTransaction.description.trim()) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen tüm alanları doldurun"
      });
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Hata", 
        description: "Lütfen geçerli bir tutar girin"
      });
      return;
    }

    const transaction = {
      type: newTransaction.type,
      amount,
      description: newTransaction.description.trim(),
      date: new Date().toISOString(),
      category: categorizeTransaction(newTransaction.description)
    };

    onAddTransaction(transaction);
    setNewTransaction({ type: 'expense', amount: '', description: '' });
    
    toast({
      title: "Başarılı",
      description: `${newTransaction.type === 'income' ? 'Gelir' : 'Gider'} eklendi`
    });
  };

  const handleDeleteTransaction = (id: string) => {
    onDeleteTransaction(id);
    toast({
      title: "Silindi",
      description: "İşlem başarıyla silindi"
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {getMonthName(selectedMonth)} Bütçesi
        </h1>
        <p className="text-muted-foreground">
          Seçili ay için gelir ve gider takibi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="budget-card-success animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Gelir</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(monthlyStats.totalIncome)}
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
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(monthlyStats.totalExpenses)}
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
              <p className={`text-2xl font-bold ${
                monthlyStats.balance >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(monthlyStats.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="budget-card mb-8 animate-bounce-in">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni İşlem Ekle
        </h2>
        
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({
                ...newTransaction,
                type: e.target.value as 'income' | 'expense'
              })}
              className="px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="expense">Gider</option>
              <option value="income">Gelir</option>
            </select>

            <Input
              type="number"
              step="0.01"
              placeholder="Tutar (₺)"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({
                ...newTransaction,
                amount: e.target.value
              })}
              className="h-12"
            />

            <Input
              type="text"
              placeholder="Açıklama"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({
                ...newTransaction,
                description: e.target.value
              })}
              className="h-12"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            İşlem Ekle
          </Button>
        </form>
      </div>

      {/* Transactions List */}
      <div className="budget-card animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            İşlem Geçmişi ({monthlyStats.transactionCount})
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Henüz işlem yok</p>
            <p>Bu ay için ilk işleminizi ekleyin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.category && (
                          <>
                            <span>•</span>
                            <span className="text-primary">{transaction.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};