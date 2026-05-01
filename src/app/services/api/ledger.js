import api from "./axiosInstance";

export const getLedgerEntries = async () => {
  const response = await api.get('/ledger');
  return response.data;
};

export const getLedgerEntryById = async (id) => {
  const response = await api.get(`/ledger/${id}`);
  return response.data;
};
