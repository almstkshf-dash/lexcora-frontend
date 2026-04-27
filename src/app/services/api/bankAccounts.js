import api from "./axiosInstance";

// Get all bank accounts
export const getAllBankAccounts = async () => {
  const response = await api.get('/bank-accounts');
  return response.data;
};

// Get bank account by ID
export const getBankAccountById = async (id) => {
  const response = await api.get(`/bank-accounts/${id}`);
  return response.data;
};

// Create new bank account
export const createBankAccount = async (bankAccountData) => {
  const response = await api.post('/bank-accounts', bankAccountData);
  return response.data;
};

// Update bank account
export const updateBankAccount = async (id, bankAccountData) => {
  const response = await api.put(`/bank-accounts/${id}`, bankAccountData);
  return response.data;
};

// Delete bank account
export const deleteBankAccount = async (id) => {
  const response = await api.delete(`/bank-accounts/${id}`);
  return response.data;
};

// Get all logs for a bank account
export const getBankAccountLogs = async (id) => {
  const response = await api.get(`/bank-accounts/${id}/logs`);
  return response.data;
};

// Create new bank account log with attachments
export const createBankAccountLog = async (formData) => {
  const response = await api.post('/bank-accounts/logs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update bank account log
export const updateBankAccountLog = async (id, formData) => {
  const response = await api.put(`/bank-accounts/logs/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete bank account log
export const deleteBankAccountLog = async (id) => {
  const response = await api.delete(`/bank-accounts/logs/${id}`);
  return response.data;
};

// --- New Banking & Reconciliation Methods ---

// Import bank statement (XLSX/CSV)
export const importBankStatement = async (formData) => {
  const response = await api.post('/banking/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Auto-match transactions for a bank account
export const autoMatchTransactions = async (bankAccountId) => {
  const response = await api.post(`/banking/auto-match/${bankAccountId}`);
  return response.data;
};

// Get unreconciled statement lines
export const getUnreconciledLines = async (bankAccountId) => {
  const response = await api.get(`/banking/unreconciled/${bankAccountId}`);
  return response.data;
};

// Reconcile a statement line with an internal log
export const reconcileTransaction = async (reconciliationData) => {
  const response = await api.post('/banking/reconcile', reconciliationData);
  return response.data;
};

// Get Cash Flow Report
export const getCashFlowReport = async (filters = {}) => {
  const response = await api.get('/banking/cash-flow', { params: filters });
  return response.data;
};

// Get Daily Cash Flow (for charts)
export const getDailyCashFlow = async (days = 30) => {
  const response = await api.get('/banking/cash-flow/daily', { params: { days } });
  return response.data;
};

export const bankAccountsService = {
  getAll: getAllBankAccounts,
  getById: getBankAccountById,
  create: createBankAccount,
  update: updateBankAccount,
  delete: deleteBankAccount,
  getLogs: getBankAccountLogs,
  createLog: createBankAccountLog,
  updateLog: updateBankAccountLog,
  deleteLog: deleteBankAccountLog,
  importStatement: importBankStatement,
  autoMatch: autoMatchTransactions,
  getUnreconciled: getUnreconciledLines,
  reconcile: reconcileTransaction,
  getCashFlowData: getCashFlowReport,
  getDailyCashFlow: getDailyCashFlow
};