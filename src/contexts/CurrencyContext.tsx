import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type CurrencyCode = 'MGA' | 'EUR' | 'USD' | 'GBP';

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  MGA: { code: 'MGA', symbol: 'Ar', name: 'Ariary malgache', locale: 'fr-MG' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'fr-FR' },
  USD: { code: 'USD', symbol: '$', name: 'Dollar US', locale: 'en-US' },
  GBP: { code: 'GBP', symbol: '£', name: 'Livre Sterling', locale: 'en-GB' },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  currencyConfig: CurrencyConfig;
  availableCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'hotel_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in CURRENCY_CONFIGS) {
        return stored as CurrencyCode;
      }
    }
    return 'MGA'; // Default to Ariary
  });

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    const config = CURRENCY_CONFIGS[currency];
    
    if (currency === 'MGA') {
      // Format for Ariary - no decimals, with space separator
      return new Intl.NumberFormat('fr-MG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' Ar';
    }
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [currency]);

  const currencyConfig = CURRENCY_CONFIGS[currency];
  const availableCurrencies = Object.values(CURRENCY_CONFIGS);

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatCurrency,
      currencyConfig,
      availableCurrencies,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
