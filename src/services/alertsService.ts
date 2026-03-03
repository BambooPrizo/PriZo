import api from './api';
import { Alert } from '../types';

export interface CreateAlertParams {
  provider?: string;
  threshold_price: number;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
}

export const alertsService = {
  /**
   * Récupère les alertes de l'utilisateur
   */
  getAlerts: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alerts');
    return response.data;
  },

  /**
   * Crée une nouvelle alerte
   */
  createAlert: async (params: CreateAlertParams): Promise<Alert> => {
    const response = await api.post<Alert>('/alerts', params);
    return response.data;
  },

  /**
   * Met à jour une alerte (toggle actif/inactif)
   */
  updateAlert: async (id: string, data: Partial<Alert>): Promise<Alert> => {
    const response = await api.patch<Alert>(`/alerts/${id}`, data);
    return response.data;
  },

  /**
   * Supprime une alerte
   */
  deleteAlert: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },
};

export default alertsService;
