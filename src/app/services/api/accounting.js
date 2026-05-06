import api from "./axiosInstance";
import {
  getCashFlowReport as getBankingCashFlowReport,
  getDailyCashFlow as getBankingDailyCashFlow
} from "./bankAccounts";

/**
 * Accounting API Service
 * Handles cash flow, financial reports, and general accounting operations
 */

const PERIOD_TO_DAYS = {
  monthly: 30,
  quarterly: 90,
  yearly: 365
};

const normalizeDays = (periodOrFilters) => {
  if (typeof periodOrFilters === "string") {
    return PERIOD_TO_DAYS[periodOrFilters] || 30;
  }

  const rawDays = periodOrFilters?.days;
  const parsedDays = Number.parseInt(rawDays, 10);
  if (Number.isFinite(parsedDays) && parsedDays > 0) {
    return Math.min(parsedDays, 365);
  }

  return 30;
};

const normalizeCashFlowFilters = (periodOrFilters) => {
  if (typeof periodOrFilters !== "object" || periodOrFilters === null) {
    return {};
  }

  const filters = {};

  if (periodOrFilters.date_from) filters.date_from = periodOrFilters.date_from;
  if (periodOrFilters.date_to) filters.date_to = periodOrFilters.date_to;
  if (periodOrFilters.branch_id) filters.branch_id = periodOrFilters.branch_id;

  return filters;
};

const normalizeSummary = (summary = {}) => ({
  inflow: Number(summary.totalInflows || 0),
  outflow: Number(summary.totalOutflows || 0),
  net: Number(summary.netCashFlow || 0)
});

const normalizeChartData = (rows = []) =>
  rows.map((row) => ({
    name: row.date,
    inflow: Number(row.total_inflow || 0),
    outflow: Number(row.total_outflow || 0)
  }));

// Get Cash Flow Report (compatibility wrapper for legacy page shape)
export const getCashFlow = async (periodOrFilters = "monthly") => {
  const days = normalizeDays(periodOrFilters);
  const filters = normalizeCashFlowFilters(periodOrFilters);
  const dailyFilters = { days };
  if (filters.branch_id) dailyFilters.branch_id = filters.branch_id;

  const [summaryResponse, dailyResponse] = await Promise.all([
    getBankingCashFlowReport(filters),
    getBankingDailyCashFlow(dailyFilters)
  ]);

  const summary = normalizeSummary(summaryResponse?.data?.summary);
  const chartData = normalizeChartData(dailyResponse?.data || []);

  return {
    success: true,
    summary,
    chartData,
    raw: {
      cashFlow: summaryResponse?.data || null,
      daily: dailyResponse?.data || []
    }
  };
};

// Get Daily Cash Flow (for charts)
export const getDailyCashFlow = async (daysOrFilters = 30) => {
  return getBankingDailyCashFlow(daysOrFilters);
};

// Get Financial Statistics
export const getFinancialStats = async () => {
  const response = await api.get('/banking/stats');
  return response.data;
};

// Accounts
export const getAccounts = async (params) => {
  const response = await api.get('/accounting/accounts', { params });
  return response.data;
};

export const getAccountsTree = async (params) => {
  const response = await api.get('/accounting/accounts/tree', { params });
  return response.data;
};

export const createAccount = async (data) => {
  const response = await api.post('/accounting/accounts', data);
  return response.data;
};

export const getProfitAndLoss = async (params) => {
  const response = await api.get('/accounting/reports/profit-loss', { params });
  return response.data;
};

export const getBalanceSheet = async (params) => {
  const response = await api.get('/accounting/reports/balance-sheet', { params });
  return response.data;
};

export const getAgingReceivables = async (params) => {
  const response = await api.get('/accounting/reports/aging-receivables', { params });
  return response.data;
};

export const getAgingPayables = async (params) => {
  const response = await api.get('/accounting/reports/aging-payables', { params });
  return response.data;
};

export const getCaseFinancialSummary = async (caseId) => {
  const response = await api.get(`/accounting/reports/case-summary/${caseId}`);
  return response.data;
};

export const getProjectFinancialSummary = async (projectId) => {
  const response = await api.get(`/accounting/reports/project-summary/${projectId}`);
  return response.data;
};

export const getDepartmentFinancialSummary = async (departmentId) => {
  const response = await api.get(`/accounting/reports/department-summary/${departmentId}`);
  return response.data;
};

export const getTrialBalance = async (params) => {
  const response = await api.get('/accounting/reports/trial-balance', { params });
  return response.data;
};

export const getAccountingCashFlow = async (params) => {
  const response = await api.get('/accounting/reports/cash-flow', { params });
  return response.data;
};

// Fiscal Periods
export const getFiscalPeriods = async (params) => {
  const response = await api.get('/accounting/fiscal-periods', { params });
  return response.data;
};

export const createFiscalPeriod = async (data) => {
  const response = await api.post('/accounting/fiscal-periods', data);
  return response.data;
};

export const updateFiscalPeriodStatus = async (id, status) => {
  const response = await api.patch(`/accounting/fiscal-periods/${id}/status`, { status });
  return response.data;
};

// Budgets
export const setBudget = async (data) => {
  const response = await api.post('/accounting/budgets', data);
  return response.data;
};

export const getBudgets = async (params) => {
  const response = await api.get('/accounting/budgets', { params });
  return response.data;
};

export const getBudgetVsActual = async (params) => {
  const response = await api.get('/accounting/reports/budget-vs-actual', { params });
  return response.data;
};

export const getAssetsReport = async (params) => {
  const response = await api.get('/accounting/reports/assets', { params });
  return response.data;
};

export const accountingService = {
  getCashFlow,
  getDailyCashFlow,
  getFinancialStats,
  getAccountsTree,
  getAccounts,
  getProfitAndLoss,
  getBalanceSheet,
  getAgingReceivables,
  getAgingPayables,
  getCaseFinancialSummary,
  getProjectFinancialSummary,
  getDepartmentFinancialSummary,
  getTrialBalance,
  getAccountingCashFlow,
  getFiscalPeriods,
  createFiscalPeriod,
  updateFiscalPeriodStatus,
  setBudget,
  getBudgets,
  getBudgetVsActual,
  getAssetsReport
};
