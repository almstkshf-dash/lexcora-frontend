import api from "@/app/services/api/axiosInstance";

/**
 * Upload files to Cloudflare R2 via backend API and return formatted result
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - Optional folder path in storage (default: 'documents')
 * @returns {Promise<Array<{document_name: string, document_url: string}>>}
 */
export const uploadFiles = async (files, folder = 'documents') => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('File uploads must run in the browser');
    }

    // Validate input
    if (!files || !Array.isArray(files) || files.length === 0) {
      return [];
    }

    // Validate file sizes (10MB limit per file)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      throw new Error(`Files exceed 10MB limit: ${fileNames}`);
    }

    // Create FormData to send files
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    // Get the backend URL - use the axios instance's baseURL
    const backendUrl = api.defaults.baseURL || 'http://localhost:8080/api';
    
    // Get auth token from cookie
    const getCookie = (name) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    
    let token = getCookie('authToken');
    
    // Fallback to localStorage if cookie doesn't exist
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds

    try {
      // Upload files to backend API
      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include', // Include cookies
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Upload failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use the text as error
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Check if upload was successful
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Return the array of {document_name, document_url}
      return result.files;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout errors
      if (fetchError.name === 'AbortError') {
        throw new Error('Upload timed out. Please try uploading smaller files or fewer files at once.');
      }
      throw fetchError;
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to upload files');
  }
};

/**
 * Upload a single file to Firebase Storage and return formatted result
 * @param {File} file - File to upload
 * @param {string} folder - Optional folder path in storage (default: 'documents')
 * @returns {Promise<{document_name: string, document_url: string}>}
 */
export const uploadFile = async (file, folder = 'documents') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const result = await uploadFiles([file], folder);
    
    if (result.length === 0) {
      throw new Error('Upload failed');
    }

    return result[0];
  } catch (error) {
    throw new Error(error.message || 'Failed to upload file');
  }
};

/**
 * Delete uploaded files from storage
 * @param {string[]} fileUrls - Array of file URLs to delete
 * @returns {Promise<void>}
 */
export const deleteUploadedFiles = async (fileUrls) => {
  try {
    if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
      return;
    }

    // Get auth token
    const getCookie = (name) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    
    let token = getCookie('authToken');
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }

    const backendUrl = api.defaults.baseURL || 'http://localhost:8080/api';

    // Call backend API to delete files
    const response = await fetch(`${backendUrl}/upload/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify({ fileUrls }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete files:', errorText);
      // Don't throw - cleanup is best effort
    }
  } catch (error) {
    console.error('Error deleting uploaded files:', error);
    // Don't throw - cleanup is best effort
  }
};
