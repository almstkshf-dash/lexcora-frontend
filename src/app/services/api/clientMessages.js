import axiosInstance from './axiosInstance';

const API_URL = '/client-messages';

// ─── Templates ────────────────────────────────────────────
export const getClientMessageTemplates = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

export const getClientMessageTemplate = async (type) => {
  const response = await axiosInstance.get(`${API_URL}/${type}`);
  return response.data;
};

export const updateClientMessageTemplate = async (type, data) => {
  const response = await axiosInstance.put(`${API_URL}/${type}`, data);
  return response.data;
};

// ─── Messaging Settings ───────────────────────────────────
export const getMessagingSettings = async () => {
  const response = await axiosInstance.get(`${API_URL}/settings`);
  return response.data;
};

export const updateMessagingSettings = async (data) => {
  const response = await axiosInstance.put(`${API_URL}/settings`, data);
  return response.data;
};

// ─── Send Messages ────────────────────────────────────────
export const sendClientMessage = async ({
  message_type,
  client_ids,
  language,
  channel,
  variables,
  attachment_urls
}) => {
  const response = await axiosInstance.post(`${API_URL}/send`, {
    message_type,
    client_ids,
    language,
    channel,
    variables,
    attachment_urls
  });
  return response.data;
};
