// Kategori tanımları ve renkleri
export const CATEGORIES = {
  'Gıda & Market': {
    keywords: ['market', 'gıda', 'yemek', 'süpermarket', 'manav', 'kasap', 'fırın', 'bakkal', 'migros', 'carrefour', 'bim', 'şok', 'a101'],
    color: '#10B981', // green-500
    icon: '🛒'
  },
  'Ev & Faturalar': {
    keywords: ['kira', 'ev', 'elektrik', 'su', 'doğalgaz', 'fatura', 'aidat', 'temizlik', 'mobilya', 'tadilat'],
    color: '#F59E0B', // amber-500
    icon: '🏠'
  },
  'İletişim': {
    keywords: ['internet', 'telefon', 'telekom', 'turkcell', 'vodafone', 'türk telekom', 'avea', 'gsm'],
    color: '#3B82F6', // blue-500
    icon: '📱'
  },
  'Ulaşım': {
    keywords: ['ulaşım', 'benzin', 'otobüs', 'metro', 'taksi', 'uber', 'bitaksi', 'park', 'köprü', 'servis'],
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
    keywords: ['giyim', 'ayakkabı', 'kıyafet', 'mağaza', 'alışveriş', 'mont', 'pantolon', 'gömlek'],
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