// Default currency used across the finance unit
export const DEFAULT_CURRENCY = 'AED';

// Default locale mappings
export const LOCALE = {
  ar: 'ar-AE',
  en: 'en-US',
};

// Default VAT percentage
export const DEFAULT_VAT = '5.00';

// Bank account statuses
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// Bank log / petty-cash transaction types
export const LOG_TYPE = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  REPLENISHMENT: 'replenishment',
  DISBURSEMENT: 'disbursement',
};

// Employee cash transaction types
export const TRANSACTION_TYPE = {
  CREDIT: 'credit',
  DEBIT: 'debit',
};

// Invoice / expense statuses
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// SWR refresh interval for statistics (ms)
export const STATS_REFRESH_INTERVAL = 300_000;

// Currency display names (for print templates)
export const CURRENCY_NAMES = {
  AED: { ar: 'درهم إماراتي', en: 'UAE Dirham' },
  USD: { ar: 'دولار أمريكي', en: 'US Dollar' },
  EUR: { ar: 'يورو', en: 'Euro' },
  GBP: { ar: 'جنيه إسترليني', en: 'British Pound' },
  SAR: { ar: 'ريال سعودي', en: 'Saudi Riyal' },
};
