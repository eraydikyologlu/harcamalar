import { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Filter, ArrowUpDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Transaction } from './BudgetTracker';
import { formatCurrency, getMonthName, formatDate } from '../utils/formatters';
import { categorizeTransaction, getAllCategories, getCategoryIcon } from '../utils/categories';
import { toast } from '@/hooks/use-toast';

interface DashboardProps {
  selectedMonth: string;
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onRecategorizeAll: () => void;
  onUpdatePaymentStatus: (id: string, isPaid: boolean) => void;
  onMarkAllAsPending: () => void;
  onToggleSidebar?: () => void;
  monthlyStats: {
    totalIncome: number;
    totalExpenses: number;
    remainingDebt: number;
    balance: number;
    spendingRatio: number;
    transactionCount: number;
  };
}

export const Dashboard = ({
  selectedMonth,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onRecategorizeAll,
  onUpdatePaymentStatus,
  onMarkAllAsPending,
  onToggleSidebar,
  monthlyStats
}: DashboardProps) => {
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: ''
  });

  // Filtreleme ve sıralama state'leri
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrelenmiş ve sıralanmış işlemler
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Tip filtresi (gelir/gider)
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Sıralama
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description, 'tr');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [transactions, selectedCategory, selectedType, sortBy, sortOrder]);

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
      category: categorizeTransaction(newTransaction.description),
      isPaid: false // Yeni işlemler default olarak ödenecek
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

  const handleRecategorizeAll = () => {
    onRecategorizeAll();
    toast({
      title: "Başarılı",
      description: "Tüm işlemler yeniden sınıflandırıldı!"
    });
  };

  const handleMarkAllAsPending = () => {
    onMarkAllAsPending();
    toast({
      title: "Başarılı",
      description: "Tüm giderler ödenecek durumuna getirildi!"
    });
  };

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
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {getMonthName(selectedMonth)} Bütçesi
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Seçili ay için gelir ve gider takibi
          </p>
        </div>
        <Button 
          onClick={handleRecategorizeAll}
          variant="outline"
          className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
        >
          🔄 Kategorileri Güncelle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="budget-card animate-fade-in bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kalan Borç</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(monthlyStats.remainingDebt)}
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

      {/* Filter and Sort Controls */}
      <div className="budget-card mb-6 animate-bounce-in">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtreleme ve Sıralama
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Kategori Filtresi */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value="all">🌟 Tümü</option>
              {getAllCategories().map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tip Filtresi */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              İşlem Tipi
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value="all">💫 Tümü</option>
              <option value="income">💰 Gelir</option>
              <option value="expense">💸 Gider</option>
            </select>
          </div>

          {/* Sıralama Kriteri */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Sıralama
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'description')}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value="date">📅 Tarih</option>
              <option value="amount">💳 Tutar</option>
              <option value="description">📝 Açıklama</option>
            </select>
          </div>

          {/* Sıralama Yönü */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Sıralama Yönü
            </label>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'asc' ? '⬆️ Artan' : '⬇️ Azalan'}
            </button>
          </div>
        </div>

        {/* Filtre Özet */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            📊 Gösterilen: <strong>{filteredAndSortedTransactions.length}</strong> / {transactions.length} işlem
          </span>
          {(selectedCategory !== 'all' || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="text-primary hover:underline"
            >
              🔄 Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="budget-card animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            İşlem Geçmişi ({filteredAndSortedTransactions.length}{filteredAndSortedTransactions.length !== transactions.length ? ` / ${transactions.length}` : ''})
          </h2>
        </div>

        {filteredAndSortedTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            {transactions.length === 0 ? (
              <>
                <p className="text-lg mb-2">Henüz işlem yok</p>
                <p>Bu ay için ilk işleminizi ekleyin</p>
              </>
            ) : (
              <>
                <p className="text-lg mb-2">Filtre kriterlerinize uygun işlem bulunamadı</p>
                <p>Filtreleri değiştirmeyi deneyin</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTransactions.map((transaction) => (
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

                    {/* Payment Status Toggle - Sadece giderler için */}
                    {transaction.type === 'expense' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdatePaymentStatus(transaction.id, !transaction.isPaid)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          transaction.isPaid === false
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {transaction.isPaid === false ? '💳 Ödenecek' : '✅ Ödendi'}
                      </Button>
                    )}
                    
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