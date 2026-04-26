import api from "./axiosInstance";

const getMeetings = async (params = {}) => {
  const response = await api.get("/meetings", { params });
  return response.data;
};

const getMeetingById = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}`);
  return response.data;
};

const getMeetingsByPartyId = async (partyId) => {
  const response = await api.get(`/meetings/party/${partyId}`);
  return response.data;
};

const createMeeting = async (meetingData) => {
  const response = await api.post("/meetings", meetingData);
  return response.data;
};

const updateMeeting = async (meetingId, meetingData) => {
  const response = await api.put(`/meetings/${meetingId}`, meetingData);
  return response.data;
};

const deleteMeeting = async (meetingId) => {
  const response = await api.delete(`/meetings/${meetingId}`);
  return response.data;
};

// Meeting Documents API
const getMeetingDocuments = async (meetingId) => {
  const response = await api.get(`/meetings/${meetingId}/documents`);
  return response.data;
};

const addMeetingDocuments = async (meetingId, documents) => {
  const response = await api.post(`/meetings/${meetingId}/documents`, { documents });
  return response.data;
};

const deleteMeetingDocument = async (documentId) => {
  const response = await api.delete(`/meetings/documents/${documentId}`);
  return response.data;
};

const meetingsApi = {
  getMeetings,
  getMeetingById,
  getMeetingsByPartyId,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingDocuments,
  addMeetingDocuments,
  deleteMeetingDocument,
};

export default meetingsApi;
