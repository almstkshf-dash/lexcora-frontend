import api from "./axiosInstance";

/**
 * Accounting API Service
 * Handles cash flow, financial reports, and general accounting operations
 */

// Get Cash Flow Report
export const getCashFlow = async (period = 'monthly') => {
  const response = await api.get('/banking/cash-flow', { params: { period } });
  return response.data;
};

// Get Daily Cash Flow (for charts)
export const getDailyCashFlow = async (days = 30) => {
  const response = await api.get('/banking/cash-flow/daily', { params: { days } });
  return response.data;
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
