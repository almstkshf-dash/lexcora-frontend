import { uploadFiles } from "../../../../utils/fileUpload";
import api from "./axiosInstance";

export const createTask = async (taskData) => {
  try {
    const files = await uploadFiles(taskData.files || [], "tasks");

    const response = await api.post("/tasks", { ...taskData, files });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const getTasks = async () => {
  try {
    const response = await api.get("/tasks");
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const getAssignedToTasks = async (employeeId, options = {}) => {
  try {
    const response = await api.get(`/tasks/assigned-to/${employeeId}`, { params: options });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (taskId, updatedData) => {
  try {
    const files = await uploadFiles(updatedData.files || [], "tasks");
    const response = await api.put(`/tasks/${taskId}`, { ...updatedData, files });
    return response.data;
  } catch (error) {

    throw error;
  }
};



export const getCaseTasks = async (caseId) => {
  try {
    const response = await api.get(`/tasks/case-tasks/${caseId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};
 export const getTaskById = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};

 export const getCreatorTasks = async (employeeId, options = {}) => {
  try {
    const response = await api.get(`/tasks/creator/${employeeId}`, { params: options });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addCommentToTask = async (taskId, comment) => {
  try {
    const response = await api.post(`/tasks/${taskId}/comments`, {comment: comment});
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};
export const deleteTaskComment = async ( commentId) => {
  try {
    const response = await api.delete(`/tasks/comments/${commentId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};  

export const deleteTaskDocument = async (documentId) => {
  try {
    const response = await api.delete(`/tasks/documents/${documentId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};
