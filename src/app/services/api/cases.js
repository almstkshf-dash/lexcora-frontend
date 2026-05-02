import { uploadFiles, deleteUploadedFiles } from "../../../../utils/fileUpload";
import api from "./axiosInstance";

export const getCases = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.branchId) queryParams.append('branchId', params.branchId);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.fileNumber) queryParams.append('fileNumber', params.fileNumber);
  if (params.caseNumber) queryParams.append('caseNumber', params.caseNumber);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/cases?${queryString}` : '/cases';
  
  const response = await api.get(url);
  return response.data;
}
export const getCaseById = async (id) => {
  const response = await api.get(`/cases/${id}`);
  return response.data;
}
export const getAllCaseDetails = async (id) => {
  const response = await api.get(`/cases/all-details/${id}`);
  return response.data;
}
export const createCase = async (caseData, caseFiles, employeesFiles, courtFiles) => {
 if (caseFiles && caseFiles.length > 0) {
   const uploadedFiles = await uploadFiles(caseFiles);
    caseData.files = uploadedFiles;
  }
  if (employeesFiles && employeesFiles.length > 0) {
    const uploadedEmployeesFiles = await uploadFiles(employeesFiles);
    caseData.employeesFiles = uploadedEmployeesFiles;
  }
  if (courtFiles && courtFiles.length > 0) {
    const uploadedCourtFiles = await uploadFiles(courtFiles);
    caseData.courtFiles = uploadedCourtFiles;
  }
  const response = await api.post(`/cases`, caseData);
 
  return response.data;
}

export const createCaseWithRelations = async (data) => {
  // Upload all files first
  const uploadedData = { ...data };
  const uploadedFileUrls = []; // Track all uploaded file URLs for cleanup

  try {
    // Upload case files in parallel
    const caseFileUploads = [];
    
    if (data.caseData?.files && data.caseData.files.length > 0) {
      caseFileUploads.push(
        uploadFiles(data.caseData.files).then(uploaded => {
          uploadedData.caseData.files = uploaded;
          uploadedFileUrls.push(...uploaded.map(f => f.document_url));
        })
      );
    }
    if (data.caseData?.employeesFiles && data.caseData.employeesFiles.length > 0) {
      caseFileUploads.push(
        uploadFiles(data.caseData.employeesFiles).then(uploaded => {
          uploadedData.caseData.employeesFiles = uploaded;
          uploadedFileUrls.push(...uploaded.map(f => f.document_url));
        })
      );
    }
    if (data.caseData?.courtFiles && data.caseData.courtFiles.length > 0) {
      caseFileUploads.push(
        uploadFiles(data.caseData.courtFiles).then(uploaded => {
          uploadedData.caseData.courtFiles = uploaded;
          uploadedFileUrls.push(...uploaded.map(f => f.document_url));
        })
      );
    }
    
    // Wait for all case file uploads to complete
    await Promise.all(caseFileUploads);

    // Upload party files
    if (data.parties && data.parties.length > 0) {
      uploadedData.parties = await Promise.all(
        data.parties.map(async (party) => {
          if (party.files && party.files.length > 0) {
            const uploaded = await uploadFiles(party.files);
            uploadedFileUrls.push(...uploaded.map(f => f.document_url));
            return { ...party, files: uploaded };
          }
          return party;
        })
      );
    }

    // Upload petition files
    if (data.petitions && data.petitions.length > 0) {
      uploadedData.petitions = await Promise.all(
        data.petitions.map(async (petition) => {
          if (petition.files && petition.files.length > 0) {
            const uploaded = await uploadFiles(petition.files);
            uploadedFileUrls.push(...uploaded.map(f => f.document_url));
            return { ...petition, files: uploaded };
          }
          return petition;
        })
      );
    }

    // Upload session files
    if (data.sessions && data.sessions.length > 0) {
      uploadedData.sessions = await Promise.all(
        data.sessions.map(async (session) => {
          if (session.files && session.files.length > 0) {
            const uploaded = await uploadFiles(session.files);
            uploadedFileUrls.push(...uploaded.map(f => f.document_url));
            return { ...session, files: uploaded };
          }
          return session;
        })
      );
    }

    // Upload execution files
    if (data.executions && data.executions.length > 0) {
      uploadedData.executions = await Promise.all(
        data.executions.map(async (execution) => {
          if (execution.attachedFiles && execution.attachedFiles.length > 0) {
            const uploaded = await uploadFiles(execution.attachedFiles);
            uploadedFileUrls.push(...uploaded.map(f => f.document_url));
            return { ...execution, attachedFiles: uploaded };
          }
          return execution;
        })
      );
    }

    // Upload judicial notice files
    if (data.judicialNotices && data.judicialNotices.length > 0) {
      uploadedData.judicialNotices = await Promise.all(
        data.judicialNotices.map(async (notice) => {
          if (notice.files && notice.files.length > 0) {
            const uploaded = await uploadFiles(notice.files);
            uploadedFileUrls.push(...uploaded.map(f => f.document_url));
            return { ...notice, files: uploaded };
          }
          return notice;
        })
      );
    }

    // Upload task files
    if (data.tasks && data.tasks.length > 0) {
      uploadedData.tasks = await Promise.all(
        data.tasks.map(async (task) => {
          if (task.files && task.files.length > 0) {
            const uploaded = await uploadFiles(task.files);
            uploadedFileUrls.push(...uploaded.map(f => f.document_url));
            return { ...task, files: uploaded };
          }
          return task;
        })
      );
    }

    // Upload memo files
    if (data.memos && data.memos.length > 0) {
      uploadedData.memos = await Promise.all(
        data.memos.map(async (memo) => {
          if (memo.files && memo.files.length > 0) {
            const uploaded = await uploadFiles(memo.files);
            uploadedFileUrls.push(...uploaded.map(f => f.document_url));
            return { ...memo, files: uploaded };
          }
          return memo;
        })
      );
    }

    // Upload related documents
    if (data.caseData?.relatedFiles && data.caseData.relatedFiles.length > 0) {
      const uploaded = await uploadFiles(data.caseData.relatedFiles);
      uploadedData.caseData.relatedFiles = uploaded;
      uploadedFileUrls.push(...uploaded.map(f => f.document_url));
    }

    // Send to backend - if this fails, catch block will cleanup files
    const response = await api.post(`/cases/batch`, uploadedData);
    return response.data;

  } catch (error) {
    // Cleanup: Delete all uploaded files if API call fails
    console.error('Case creation failed, cleaning up uploaded files...');
    
    if (uploadedFileUrls.length > 0) {
      try {
        await deleteUploadedFiles(uploadedFileUrls);
        console.log(`Cleaned up ${uploadedFileUrls.length} uploaded files`);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded files:', cleanupError);
        // Don't throw - we want to show the original error
      }
    }
    
    // Re-throw the original error to show user
    throw error;
  }
}; 
export const getCaseDocuments = async (id) => {
  const response = await api.get(`/cases/${id}/documents`);
  return response.data;
};
export const deleteCaseDocument = async (caseId, documentId) => {
  const response = await api.delete(`/cases/${caseId}/documents/${documentId}`);
  return response.data;
};
export const getCaseEmployeesDocuments = async (id) => {
  const response = await api.get(`/cases/${id}/employees-documents`);
  return response.data;
};
export const deleteCaseEmployeeDocument = async (caseId, documentId) => {
  const response = await api.delete(`/cases/${caseId}/employees-documents/${documentId}`);
  return response.data;
}

export const getCaseCourtDocuments = async (id) => {
  const response = await api.get(`/cases/${id}/court-documents`);
  return response.data;
};
export const deleteCaseCourtDocument = async (caseId, documentId) => {
  const response = await api.delete(`/cases/${caseId}/court-documents/${documentId}`);
  return response.data;
};
export const deleteCase = async (id) => {
  const response = await api.delete(`/cases/${id}`);
  return response.data;
};
export const updateCase = async (id, caseData, caseFiles, employeesFiles, courtFiles) => {
//  console.log('updateCase called with:', { caseFiles });
//   return null
  if (caseFiles && caseFiles.length > 0) {
    const uploadedFiles = await uploadFiles(caseFiles);
    caseData.files = uploadedFiles;
  }
  if (employeesFiles && employeesFiles.length > 0) {
    const uploadedEmployeesFiles = await uploadFiles(employeesFiles);
    caseData.employeesFiles = uploadedEmployeesFiles;
  }
  if (courtFiles && courtFiles.length > 0) {
    const uploadedCourtFiles = await uploadFiles(courtFiles);
    caseData.courtFiles = uploadedCourtFiles;
  }
  const response = await api.put(`/cases/${id}`, caseData);

  return response.data;
}


export const caseTypes = async () => {
  const response = await api.get(`/case-types`);
  return response.data;
}
export const createCaseType = async (caseData) => {
  const response = await api.post(`/case-types`, caseData);
  return response.data;
}
export const caseClassifications = async () => {  
  const response = await api.get(`/case-classifications`);
  return response.data;
}
export const createCaseClassification = async (caseData) => {
  const response = await api.post(`/case-classifications`, caseData);
  return response.data;
}
export const searchCasesForAddNewCasePage = async (term) => {
  try {
    const response = await api.get(`/cases/search`, { params: { searchTerm: term } });
    return response.data;
  } catch (error) {

    throw error;
  } 
}

export const searchCases = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { success: true, data: [] };
    }
    const response = await api.get(`/cases/search`, { 
      params: { searchTerm: searchTerm.trim() } 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}