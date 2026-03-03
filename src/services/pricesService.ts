import api from './api';
import { PricesResponse, HistoryResponse, RouteParams } from '../types';

export interface PricesParams extends RouteParams {
  vehicle_type?: 'moto' | 'standard' | 'premium';
}

export interface HistoryParams extends RouteParams {
  provider?: string;
  days?: number;
}

export const pricesService = {
  /**
   * Récupère les prix comparés pour un trajet
   */
  getPrices: async (params: PricesParams): Promise<PricesResponse> => {
    const response = await api.get<PricesResponse>('/prices', {
      params: {
        from_lat: params.from_lat,
        from_lng: params.from_lng,
        to_lat: params.to_lat,
        to_lng: params.to_lng,
        vehicle_type: params.vehicle_type,
      },
    });
    return response.data;
  },

  /**
   * Récupère l'historique des prix pour un trajet
   */
  getPricesHistory: async (params: HistoryParams): Promise<HistoryResponse> => {
    const response = await api.get<HistoryResponse>('/prices/history', {
      params: {
        from_lat: params.from_lat,
        from_lng: params.from_lng,
        to_lat: params.to_lat,
        to_lng: params.to_lng,
        provider: params.provider,
        days: params.days || 7,
      },
    });
    return response.data;
  },
};

export default pricesService;
