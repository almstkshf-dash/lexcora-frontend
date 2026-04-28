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

export const accountingService = {
  getCashFlow,
  getDailyCashFlow,
  getFinancialStats
};
