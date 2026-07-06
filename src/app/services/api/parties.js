import { uploadFiles } from "../../../../utils/fileUpload";
import api from "./axiosInstance";

export const getAllParties = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const url = queryString ? `/parties?${queryString}` : '/parties';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getPotentialClients = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();

    const url = queryString ? `/parties/potential-clients?${queryString}` : '/parties/potential-clients';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCaseParties = async (caseId) => {
  try {
    const response = await api.get(`/cases/${caseId}/parties`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const createParty = async (partyData) => {
  const files = partyData.files && partyData.files.length > 0
    ? await uploadFiles(partyData.files)
    : [];
  partyData.files = files;
  const response = await api.post("/parties", partyData);
  return response.data;
}
export const addPartyToCase = async (partyData) => {
  if (partyData.files && partyData.files.length > 0) {
    const uploadedFiles = await uploadFiles(partyData.files);
    partyData.files = uploadedFiles;
  }
  const response = await api.post(`/cases/${partyData.caseId}/add-party`, { 
    party_id: partyData.partyId,
    type: partyData.type,
    files: partyData.files
  });
  return response.data;
} 

export const updateCaseParty = async (caseId, partyId, partyData) => {
  if (partyData.files && partyData.files.length > 0) {
    const uploadedFiles = await uploadFiles(partyData.files);
    partyData.files = uploadedFiles;
  }
  const response = await api.put(`/cases/${caseId}/parties/${partyId}`, partyData);
  return response.data;
}
export const removePartyFromCase = async (caseId, partyId) => {
  const response = await api.delete(`/cases/${caseId}/party/${partyId}`);
  return response.data;
}
export const getCasePartyDocuments = async (caseId, partyId) => {
  const response = await api.get(`/cases/${caseId}/party-documents/${partyId}`);
  return response.data;
}
export const addCasePartyDocument = async (caseId, partyId, documentData) => {
  if (documentData.files && documentData.files.length > 0) {
    const uploadedFiles = await uploadFiles(documentData.files);
    documentData.files = uploadedFiles;
  }
  const response = await api.post(`/cases/${caseId}/party-documents/${partyId}`, documentData);
  return response.data;
} 
export const deleteCasePartyDocument = async (caseId, partyId, documentId) => {
  const response = await api.delete(`/cases/${caseId}/party-documents/${partyId}/${documentId}`);
  return response.data;
}

export const getPartyCases = async (partyId) => {
  try {
    const response = await api.get(`/parties/${partyId}/cases`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getPartiesByBranch = async (branchId) => {
  const response = await api.get(`/parties/branch/${branchId}`);
  return response.data;
};

/**
 * Fetch a single party record by ID.
 *
 * Response contract
 * -----------------
 * The server returns the record directly (no { success, data } envelope):
 *   {
 *     id, name, phone, email, address, e_id, passport, nationality,
 *     party_type (may also arrive as Party_type — always read both),
 *     status, category, consultation_type, source, branch_id,
 *     is_vip (0 | 1 | boolean), documents: Array, ...
 *   }
 *
 * Callers should access fields directly off the returned object, e.g.:
 *   const party = await getPartyById(id);
 *   party.name   // ✅
 *   party.data   // ❌ — there is no envelope wrapper
 */
export const getPartyById = async (partyId) => {
  try {
    const response = await api.get(`/parties/${partyId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a party record.
 *
 * Response contract
 * -----------------
 * Returns the updated record (same shape as getPartyById) or
 * { success: true, message: string } on some backend versions.
 */
export const updateParty = async (partyId, partyData) => {
  const files = partyData.files && partyData.files.length > 0
    ? await uploadFiles(partyData.files)
    : [];
  if (files.length > 0) {
    partyData.files = files;
  } else {
    delete partyData.files;
  }
  const response = await api.put(`/parties/${partyId}`, partyData);
  return response.data;
};

/**
 * Reset a party's password.
 * Sends a new plaintext password to the backend; the backend is responsible
 * for hashing it before storage. Never send an existing hash here.
 */
export const resetPartyPassword = async (partyId, newPassword) => {
  const response = await api.put(`/parties/${partyId}/reset-password`, { password: newPassword });
  return response.data;
};

export const deleteParty = async (partyId) => {
  try {
    const response = await api.delete(`/parties/${partyId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchParties = async (query, partyType = null) => {
  try {
    if (!query || query.trim().length < 3) {
      return { success: true, data: [] };
    }
    let url = `/parties/search?query=${encodeURIComponent(query.trim())}`;
    if (partyType) {
      url += `&partyType=${partyType}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkDuplicateParty = async (name, phone, email = null, excludeId = null) => {
  try {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (phone) params.append('phone', phone);
    if (email) params.append('email', email);
    if (excludeId) params.append('excludeId', excludeId);
    
    const response = await api.get(`/parties/check-duplicate?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getClientsForFinance = async (page = 1, limit = 20, search = "") => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    
    const response = await api.get(`/parties/finance-clients?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};