import api from "./axiosInstance";

export const getGlobalSettings = async () => {
  const response = await api.get("/settings");
  return response.data;
};

export const updateGlobalSettings = async (settingsData) => {
  const response = await api.put("/settings", settingsData);
  return response.data;
};
