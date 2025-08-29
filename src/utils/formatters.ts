// Para formatı
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Tarih formatı
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Ay adları (Türkçe)
const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// YYYY-MM formatından Türkçe ay adı
export const getMonthName = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex] || 'Bilinmeyen';
  return `${monthName} ${year}`;
};

// Kısa ay adı (grafiklerde kullanım için)
export const getShortMonthName = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex]?.slice(0, 3) || 'Bil';
  return `${monthName} ${year.slice(2)}`;
};