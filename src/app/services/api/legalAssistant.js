import api from "./axiosInstance";

const getAuthToken = () => {
  if (typeof document !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; authToken=`);
    if (parts.length === 2) {
      const token = parts.pop()?.split(';').shift();
      if (token) return token;
    }
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || null;
  }
  return null;
};

/**
 * Chat with the legal assistant
 * @param {Object} payload - The chat payload
 * @param {string} payload.message - The user's message
 * @param {string} payload.userName - The user's name
 * @param {string|number} payload.userId - The user's ID
 * @param {Array} payload.history - The conversation history
 * @returns {Promise} API response with answer and sources
 */
export const chatWithLegalAssistant = async (payload) => {
  const response = await api.post("/legal-assistant", payload);
  return response.data;
};

/**
 * Stream chat with the legal assistant (if supported). Falls back to throwing if not available.
 * @param {Object} payload - The chat payload
 * @returns {Promise<ReadableStreamDefaultReader>}
 */
export const chatWithLegalAssistantStream = async (payload) => {
  const baseURL = api.defaults.baseURL || '';
  const token = getAuthToken();

  const response = await fetch(`${baseURL}/legal-assistant/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error('Streaming not available');
  }

  return response.body.getReader();
};

export const getLegalAssistantHistory = async (caseId, limit = 50) => {
  try {
    const response = await api.get(`/legal-assistant/history/${caseId}`, {
      params: { limit },
    });
    return response.data;
  } catch (err) {
    console.warn('History fetch failed', err?.response?.status, err?.message);
    return { success: false, data: [], error: err?.message };
  }
};

export default {
  chatWithLegalAssistant,
  chatWithLegalAssistantStream,
  getLegalAssistantHistory,
};
