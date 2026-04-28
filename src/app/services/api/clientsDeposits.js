import axiosInstance from "./axiosInstance";

export const getDepositsByPartyId = async (partyId) => {
  const normalizedPartyId = Number(partyId);
  if (!Number.isInteger(normalizedPartyId) || normalizedPartyId <= 0) {
    return { data: [] };
  }

  try {
    const response = await axiosInstance.get(`/clients-deposits/party/${normalizedPartyId}`);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    console.error("Error fetching deposits:", error);

    // Keep UI functional when backend returns server-side errors.
    if (status >= 500) {
      return { data: [] };
    }

    throw error;
  }
};

export const createDeposit = async (depositData) => {
  try {
    const response = await axiosInstance.post("/clients-deposits", depositData);
    return response.data;
  } catch (error) {
    console.error("Error creating deposit:", error);
    throw error;
  }
};

export const updateDeposit = async (depositId, depositData) => {
  try {
    const response = await axiosInstance.put(`/clients-deposits/${depositId}`, depositData);
    return response.data;
  } catch (error) {
    console.error("Error updating deposit:", error);
    throw error;
  }
};

export const deleteDeposit = async (depositId) => {
  try {
    const response = await axiosInstance.delete(`/clients-deposits/${depositId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting deposit:", error);
    throw error;
  }
};

export const getAccountStatement = async (partyId, dateFrom = null, dateTo = null) => {
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/clients-deposits/account-statement/${partyId}?${queryString}`
      : `/clients-deposits/account-statement/${partyId}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching account statement:", error);
    throw error;
  }
};
