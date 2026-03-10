import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// URL de l'API - utiliser l'IP locale pour le développement mobile
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.149:3001/v1';

console.log('🔌 API URL configurée:', API_URL);

// Instance Axios configurée
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : ajoute le Bearer token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : gère les erreurs 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré - supprime le token stocké
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch (e) {
        console.error('Erreur lors de la suppression du token:', e);
      }
      // L'app gérera la redirection via le state Redux
    }
    return Promise.reject(error);
  }
);

export default api;
