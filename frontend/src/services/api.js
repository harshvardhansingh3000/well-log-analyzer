import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Upload LAS file
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Get all wells
export const getWells = async () => {
  const response = await axios.get(`${API_URL}/wells`);
  return response.data;
};

// Get well by ID
export const getWell = async (id) => {
  const response = await axios.get(`${API_URL}/wells/${id}`);
  return response.data;
};

// Get available curves
export const getCurves = async (wellId) => {
  const response = await axios.get(`${API_URL}/wells/${wellId}/curves`);
  return response.data;
};

// Get well data
export const getWellData = async (wellId, startDepth, endDepth, curves = null) => {
  let url = `${API_URL}/wells/${wellId}/data?startDepth=${startDepth}&endDepth=${endDepth}`;
  
  if (curves && curves.length > 0) {
    url += `&curves=${curves.join(',')}`; 
  }
  
  const response = await axios.get(url);
  return response.data;
};

// AI interpretation
export const interpretData = async (wellId, startDepth, endDepth, curves) => {
  const response = await axios.post(`${API_URL}/wells/${wellId}/interpret`, {
    startDepth,
    endDepth,
    curves,
  });
  return response.data;
};

// Chat with AI
export const sendChatMessage = async (wellId, message, conversationHistory = []) => {
  const response = await axios.post(`${API_URL}/chat`, {
    wellId,
    message,
    conversationHistory,
  });
  return response.data.response;
};
