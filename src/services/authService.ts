import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  /**
   * Connexion utilisateur
   */
  login: async (phone: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      phone,
      password,
    });
    return response.data;
  },

  /**
   * Inscription utilisateur
   */
  register: async (
    phone: string,
    password: string,
    name: string
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      phone,
      password,
      name,
    });
    return response.data;
  },

  /**
   * Rafraîchir le token JWT
   */
  refreshToken: async (): Promise<{ token: string; expires_in: number }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

export default authService;
