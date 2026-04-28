import axiosInstance from './axiosInstance';

/**
 * Upload files to the backend (Vercel Blob)
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - Folder path in storage (e.g., 'tasks')
 * @returns {Promise<{success: boolean, files: Array<{document_name: string, document_url: string}>, error?: string}>}
 */
export const uploadFiles = async (files, folder = 'documents') => {
  try {
    if (!files || files.length === 0) {
      return { success: true, files: [] };
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const response = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return {
        success: true,
        files: response.data.files
      };
    } else {
      return {
        success: false,
        files: [],
        error: response.data.error || 'Upload failed'
      };
    }
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      files: [],
      error: error.response?.data?.error || error.message || 'Upload failed'
    };
  }
};

/**
 * Upload a single file
 * @param {File} file - File to upload
 * @param {string} folder - Folder path in storage
 */
export const uploadFile = async (file, folder = 'documents') => {
  const result = await uploadFiles([file], folder);
  if (result.success && result.files.length > 0) {
    return {
      success: true,
      file: result.files[0]
    };
  }
  return result;
};
