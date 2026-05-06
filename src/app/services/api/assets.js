import api from "./axiosInstance";

export const getAssets = async (branchId = null) => {
  const url = branchId ? `/assets` : '/assets';
  const response = await api.get(url);
  return response.data;
};

export const getAssetById = async (id) => {
  const response = await api.get(`/assets/${id}`);
  return response.data;
};

export const getAssetDocuments = async (assetId) => {
  const response = await api.get(`/assets/${assetId}/documents`);
  return response.data;
};

export const createAsset = async (assetData) => {
  const response = await api.post("/assets", assetData);
  return response.data;
};

export const updateAsset = async (id, assetData) => {
  const response = await api.put(`/assets/${id}`, assetData);
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};

export const getDepreciationMethods = async () => {
  const response = await api.get('/assets/depreciation/methods');
  return response.data;
};

export const getDepreciationPreview = async (previewData) => {
  const response = await api.post('/assets/depreciation/preview', previewData);
  return response.data;
};

export const deleteAssetDocument = async (assetId, documentId) => {
  const response = await api.delete(`/assets/${assetId}/documents/${documentId}`);
  return response.data;
};
