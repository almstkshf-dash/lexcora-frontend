import api from "./axiosInstance";
import { uploadFile, uploadFiles } from "../../../../utils/fileUpload";

export const getEmployees = async () => {
  const response = await api.get("/employees");
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};


export const createEmployee = async (employeeData) => {
  const response = await api.post("/employees", employeeData);
  return response.data;
};

export const getEmployeePermissions = async (id) => {
  const response = await api.get(`/permissions/employee/${id}`);
  return response.data;
}
export const assignPermissionsToEmployee = async (id, permissions) => {
  const response = await api.post(`/permissions/employee/${id}/permissions`, { permissions });
  return response.data;
}

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

// Employee Documents APIs
export const getEmployeeDocuments = async (employeeId) => {
  const response = await api.get(`/employee-documents/employee/${employeeId}`);
  return response.data;
};

export const getEmployeeDocumentsByType = async (employeeId, type) => {
  const response = await api.get(`/employee-documents/employee/${employeeId}/type/${type}`);
  return response.data;
};

export const getEmployeeDocumentCounts = async (employeeId) => {
  const response = await api.get(`/employee-documents/employee/${employeeId}/counts`);
  return response.data;
};

export const uploadEmployeeDocument = async (employeeId, documentType, file) => {
  // First upload file to get URL
  const uploadedFile = await uploadFile(file);
  // Then create document record

  // return null
  const response = await api.post('/employee-documents/upload', {
    employee_id: employeeId,
    document_type: documentType,
    document_name: uploadedFile.document_name,
    document_url: uploadedFile.document_url,
  });
  
  return response.data;
};

export const deleteEmployeeDocument = async (documentId) => {
  const response = await api.delete(`/employee-documents/${documentId}`);
  return response.data;
};

export const checkDuplicateEmployee = async (name, phone, email, username = null, employeeNumber = null, excludeId = null) => {
  try {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (phone) params.append('phone', phone);
    if (email) params.append('email', email);
    if (username) params.append('username', username);
    if (employeeNumber) params.append('employeeNumber', employeeNumber);
    if (excludeId) params.append('excludeId', excludeId);
    
    const response = await api.get(`/employees/check-duplicate?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
