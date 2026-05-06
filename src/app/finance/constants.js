// Default currency used across the finance unit
export const DEFAULT_CURRENCY = 'AED';

// Default locale mappings
export const LOCALE = {
  ar: 'ar-AE',
  en: 'en-US',
};

// Default VAT percentage
export const DEFAULT_VAT = '5.00';

// VAT Categories for UAE FTA Compliance
export const VAT_CATEGORY = {
  STANDARD: 'standard', // 5%
  ZERO: 'zero',         // 0%
  EXEMPT: 'exempt',     // 0% (Exempt)
  OUT_OF_SCOPE: 'out_of_scope', // 0% (Out of scope)
};

export const VAT_RATES = {
  [VAT_CATEGORY.STANDARD]: 5.00,
  [VAT_CATEGORY.ZERO]: 0.00,
  [VAT_CATEGORY.EXEMPT]: 0.00,
  [VAT_CATEGORY.OUT_OF_SCOPE]: 0.00,
};

export const EMIRATES = [
  { id: 'abu_dhabi', ar: 'أبوظبي', en: 'Abu Dhabi' },
  { id: 'dubai', ar: 'دبي', en: 'Dubai' },
  { id: 'sharjah', ar: 'الشارقة', en: 'Sharjah' },
  { id: 'ajman', ar: 'عجمان', en: 'Ajman' },
  { id: 'umm_al_quwain', ar: 'أم القيوين', en: 'Umm Al Quwain' },
  { id: 'ras_al_khaimah', ar: 'رأس الخيمة', en: 'Ras Al Khaimah' },
  { id: 'fujairah', ar: 'الفجيرة', en: 'Fujairah' },
];

// VAT Report Form VAT201 Sections
export const VAT_REPORT_SECTIONS = {
  SALES: 'sales',
  PURCHASES: 'purchases',
};

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
