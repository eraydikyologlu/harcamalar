// Kategori tanımları ve renkleri
export const CATEGORIES = {
  'Gıda & Market': {
    keywords: ['market', 'gıda', 'yemek', 'süpermarket', 'manav', 'kasap', 'fırın', 'bakkal', 'migros', 'carrefour', 'bim', 'şok', 'a101'],
    color: '#10B981', // green-500
    icon: '🛒'
  },
  'Ev & Faturalar': {
    keywords: ['kira', 'ev', 'elektrik', 'su', 'su faturası', 'doğalgaz', 'fatura', 'aidat', 'temizlik', 'mobilya', 'tadilat', 'internet', 'turk telekom', 'çayırhan'],
    color: '#F59E0B', // amber-500
    icon: '🏠'
  },
  'İletişim': {
    keywords: ['telefon', 'telekom', 'turkcell', 'vodafone', 'türk telekom', 'avea', 'gsm', 'fatura'],
    color: '#3B82F6', // blue-500
    icon: '📱'
  },
  'Kredi Kartı': {
    keywords: ['kredi kartı', 'ziraat', 'akbank', 'garanti', 'ekstre', 'asgari', 'kart'],
    color: '#DC2626', // red-600
    icon: '💳'
  },
  'Kredi': {
    keywords: ['kredi', 'banka', 'taksit', 'faiz'],
    color: '#B91C1C', // red-700
    icon: '🏦'
  },
  'Maaş & Gelir': {
    keywords: ['maaş', 'maaş', 'ek mesai', 'mesai', 'gelir', 'ödeme'],
    color: '#059669', // emerald-600
    icon: '💰'
  },
  'Aile & Kişisel': {
    keywords: ['peder', 'anne', 'baba', 'aile', 'kişisel'],
    color: '#7C3AED', // violet-600
    icon: '👨‍👩‍👧‍👦'
  },
  'Abonelik & Üyelik': {
    keywords: ['abonman', 'abonelik', 'üyelik', 'aylık', 'premium'],
    color: '#0891B2', // cyan-600
    icon: '📺'
  },
  'Taksi': {
    keywords: ['taksi', 'uber', 'bitaksi', 'taksici'],
    color: '#F97316', // orange-500
    icon: '🚕'
  },
  'Ulaşım': {
    keywords: ['ulaşım', 'benzin', 'otobüs', 'metro', 'park', 'köprü', 'servis', 'otopark'],
    color: '#8B5CF6', // violet-500
    icon: '🚗'
  },
  'Eğlence': {
    keywords: ['eğlence', 'sinema', 'restoran', 'kafe', 'bar', 'konser', 'tiyatro', 'oyun', 'spor', 'fitness'],
    color: '#EC4899', // pink-500
    icon: '🎉'
  },
  'Sağlık': {
    keywords: ['doktor', 'eczane', 'hastane', 'sağlık', 'ilaç', 'muayene', 'diş', 'göz', 'check-up'],
    color: '#EF4444', // red-500
    icon: '🏥'
  },
  'Eğitim': {
    keywords: ['okul', 'üniversite', 'kurs', 'kitap', 'eǧitim', 'öğrenim', 'ders', 'sınav'],
    color: '#06B6D4', // cyan-500
    icon: '📚'
  },
  'Giyim': {
    keywords: ['giyim', 'ayakkabı', 'kıyafet', 'mağaza', 'alışveriş', 'mont', 'pantolon', 'gömlek', 'elbise', 'fatma'],
    color: '#84CC16', // lime-500
    icon: '👕'
  },
  'Diğer': {
    keywords: [],
    color: '#6B7280', // gray-500
    icon: '📋'
  }
};

// Açıklamaya göre kategori belirleme
export const categorizeTransaction = (description: string): string => {
  const lowerDescription = description.toLowerCase().trim();

  for (const [categoryName, categoryData] of Object.entries(CATEGORIES)) {
    if (categoryName === 'Diğer') continue; // Diğer kategoriyi son olarak kontrol et
    
    const hasKeyword = categoryData.keywords.some(keyword => 
      lowerDescription.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      return categoryName;
    }
  }

  return 'Diğer';
};

// Kategori rengi getirme
export const getCategoryColor = (category: string): string => {
  return CATEGORIES[category as keyof typeof CATEGORIES]?.color || CATEGORIES['Diğer'].color;
};

// Kategori ikonu getirme
export const getCategoryIcon = (category: string): string => {
  return CATEGORIES[category as keyof typeof CATEGORIES]?.icon || CATEGORIES['Diğer'].icon;
};

// Tüm kategorileri listeleme
export const getAllCategories = (): string[] => {
  return Object.keys(CATEGORIES);
};