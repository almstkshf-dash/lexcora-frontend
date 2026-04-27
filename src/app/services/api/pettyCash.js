import api from "./axiosInstance";

// Get all petty cash funds
export const getAllPettyCashFunds = async (branchId = null) => {
  const response = await api.get('/petty-cash/funds', { params: { branch_id: branchId } });
  return response.data;
};

// Get petty cash fund by ID
export const getPettyCashFundById = async (id) => {
  const response = await api.get(`/petty-cash/funds/${id}`);
  return response.data;
};

// Create new petty cash fund
export const createPettyCashFund = async (fundData) => {
  const response = await api.post('/petty-cash/funds', fundData);
  return response.data;
};

// Create new petty cash transaction
export const createPettyCashTransaction = async (transactionData) => {
  const response = await api.post('/petty-cash/transactions', transactionData);
  return response.data;
};

// Get transactions for a petty cash fund
export const getPettyCashTransactions = async (id, filters = {}) => {
  const response = await api.get(`/petty-cash/funds/${id}/transactions`, { params: filters });
  return response.data;
};

export const pettyCashService = {
  getFunds: getAllPettyCashFunds,
  getFundById: getPettyCashFundById,
  createFund: createPettyCashFund,
  createTransaction: createPettyCashTransaction,
  getTransactions: getPettyCashTransactions
};


