import api from './api';
import { Contribution, ContributionResponse, ContributionsResponse } from '../types';

export const contributionService = {
  /**
   * Soumet une nouvelle contribution de prix
   */
  submitContribution: async (data: Contribution): Promise<ContributionResponse> => {
    const response = await api.post<ContributionResponse>('/contributions', data);
    return response.data;
  },

  /**
   * Récupère les contributions de l'utilisateur connecté
   */
  getMyContributions: async (): Promise<ContributionsResponse> => {
    const response = await api.get<ContributionsResponse>('/contributions/me');
    return response.data;
  },

  /**
   * Récupère les dernières contributions de la communauté
   */
  getRecentContributions: async (limit: number = 3): Promise<any[]> => {
    const response = await api.get('/contributions/recent', {
      params: { limit },
    });
    return response.data;
  },
};

export default contributionService;
