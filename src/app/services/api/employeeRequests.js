import api from "./axiosInstance";

// ─── Fetch list ────────────────────────────────────────────────────
export const getEmployeeRequests = async (params = {}) => {
  const {
    employee_id     = null,
    page            = 1,
    limit           = 20,
    manager_approval = null,
    hr_approval     = null,
    finance_approval = null,
    type            = null,
    search          = null
  } = params;

  const qp = new URLSearchParams();
  if (employee_id)      qp.append('employee_id',      employee_id);
  if (page)             qp.append('page',              page);
  if (limit)            qp.append('limit',             limit);
  if (manager_approval) qp.append('manager_approval',  manager_approval);
  if (hr_approval)      qp.append('hr_approval',       hr_approval);
  if (finance_approval) qp.append('finance_approval',  finance_approval);
  if (type)             qp.append('type',               type);
  if (search)           qp.append('search',             search);

  const response = await api.get(`/employee-requests?${qp.toString()}`);
  return response.data;
};

export const getEmployeeRequestById = async (id) => {
  const response = await api.get(`/employee-requests/${id}`);
  return response.data;
};

export const getRequestsByEmployeeId = async (employeeId) => {
  const response = await api.get(`/employee-requests/employee/${employeeId}`);
  return response.data;
};

// ─── Finance Summary (Finance dept view) ──────────────────────────
export const getHRFinanceSummary = async (params = {}) => {
  const qp = new URLSearchParams();
  if (params.start_date)    qp.append('start_date',    params.start_date);
  if (params.end_date)      qp.append('end_date',      params.end_date);
  if (params.department_id) qp.append('department_id', params.department_id);
  const response = await api.get(`/employee-requests/finance-summary?${qp.toString()}`);
  return response.data;
};

// ─── Create / Update ──────────────────────────────────────────────
export const createEmployeeRequest = async (requestData) => {
  const response = await api.post("/employee-requests", requestData);
  return response.data;
};

export const updateEmployeeRequest = async (id, requestData) => {
  const response = await api.put(`/employee-requests/${id}`, requestData);
  return response.data;
};

// ─── Approval endpoints ───────────────────────────────────────────
export const updateManagerApproval = async (id, managerApproval) => {
  const response = await api.patch(`/employee-requests/${id}/manager-approval`, {
    manager_approval: managerApproval
  });
  return response.data;
};

export const updateHrApproval = async (id, hrApproval) => {
  const response = await api.patch(`/employee-requests/${id}/hr-approval`, {
    hr_approval: hrApproval
  });
  return response.data;
};

/**
 * Finance dept approval — auto-creates journal entry when approved.
 * Requires 'Finance Approve HR Request' permission on the backend.
 */
export const updateFinanceApproval = async (id, financeApproval, financeNotes = '') => {
  const response = await api.patch(`/employee-requests/${id}/finance-approval`, {
    finance_approval: financeApproval,
    finance_notes:    financeNotes
  });
  return response.data;
};

/**
 * Update financial values (daily_rate, leave_value_aed, pay_type, accounts).
 * Requires 'Edit Paid/Unpaid Leave Value' or 'Edit Leave Pay Type' permission.
 */
export const updateLeaveFinancialValues = async (id, financialData) => {
  const response = await api.patch(`/employee-requests/${id}/financial-values`, financialData);
  return response.data;
};

// ─── Delete ───────────────────────────────────────────────────────
export const deleteEmployeeRequest = async (id) => {
  const response = await api.delete(`/employee-requests/${id}`);
  return response.data;
};
