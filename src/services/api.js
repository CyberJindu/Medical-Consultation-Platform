import axios from 'axios';

// API base URL - now pointing to your live backend
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mediguide-backend-pg59.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased timeout for AI responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediguide_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('mediguide_token');
      localStorage.removeItem('mediguide_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (phoneNumber) => 
    api.post('/auth/login', { phoneNumber }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (profileData) => 
    api.put('/auth/profile', profileData),
};

export const chatAPI = {
  sendMessage: (message, conversationId = null) => 
    api.post('/chat/send', { message, conversationId }),

  sendMessageWithImage: (formData, conversationId = null) => 
    api.post('/chat/send-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getConversations: () => 
    api.get('/chat/conversations'),
  
  getConversation: (conversationId) => 
    api.get(`/chat/conversations/${conversationId}`),
  
  deleteConversation: (conversationId) => 
    api.delete(`/chat/conversations/${conversationId}`),
};

export const specialistAPI = {
  getRecommendations: (conversationContext) => 
    api.post('/specialists/recommend', { conversationContext }),
  
  getAllSpecialists: (filters = {}) => 
    api.get('/specialists', { params: filters }),
  
  getSpecialist: (specialistId) => 
    api.get(`/specialists/${specialistId}`),
};

export const healthFeedAPI = {
  getPersonalizedFeed: () => 
    api.get('/feed/personalized'),
  
  getFeedByTopics: (topics) => 
    api.get('/feed/by-topics', { params: { topics } }),
  
  saveArticle: (articleId) => 
    api.post(`/feed/articles/${articleId}/save`),
  
  shareArticle: (articleId) => 
    api.post(`/feed/articles/${articleId}/share`),
};

// Utility function to check API health
export const checkAPIHealth = () => 
  api.get('/health');


export default api;
