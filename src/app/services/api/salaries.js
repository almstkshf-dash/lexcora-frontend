import api from "./axiosInstance";

export const getSalaries = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/salaries?${params.toString()}`);
  return response.data;
};

export const getSalaryById = async (id) => {
  const response = await api.get(`/salaries/${id}`);
  return response.data;
};

export const processPayroll = async (payrollData) => {
  const response = await api.post("/salaries/process", payrollData);
  return response.data;
};

export const paySalary = async (id, paymentData) => {
  const response = await api.post(`/salaries/${id}/pay`, paymentData);
  return response.data;
};
