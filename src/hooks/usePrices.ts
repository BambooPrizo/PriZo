// ============================================
// HOOK - Gestion des prix avec cache et offline
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPrices } from '../store/pricesSlice';
import { usePriceCache, useRecentSearches } from './useCache';
import { useNetworkStatus } from './useNetworkStatus';
import { getPricesForRoute, VTC_PROVIDERS } from '../data/vtcData';
import { PriceResult, RouteParams } from '../types';
import { TIMING, MESSAGES } from '../constants';
import { retryWithBackoff } from '../utils';

interface UsePricesReturn {
  prices: PriceResult[];
  isLoading: boolean;
  error: string | null;
  isOfflineData: boolean;
  cacheAge: number | null;
  search: (params: RouteParams) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const usePrices = (): UsePricesReturn => {
  const dispatch = useAppDispatch();
  const { results, isLoading: reduxLoading, error: reduxError } = useAppSelector((state) => state.prices);
  
  const [localPrices, setLocalPrices] = useState<PriceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  
  const { getCachedPrices, setCachedPrices } = usePriceCache();
  const { addRecentSearch } = useRecentSearches();
  const { isOnline, isOffline } = useNetworkStatus();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastParamsRef = useRef<RouteParams | null>(null);

  const loadLocalPrices = useCallback((fromLabel: string, toLabel: string): PriceResult[] => {
    const routeData = getPricesForRoute(fromLabel, toLabel);
    
    if (!routeData) {
      // Données par défaut si trajet non trouvé
      return VTC_PROVIDERS.slice(0, 4).map((provider, index) => ({
        provider: provider.name,
        vehicle_type: 'standard' as const,
        price_min: 1000 + index * 200,
        price_max: 1500 + index * 200,
        currency: 'XOF',
        deeplink: provider.deeplink,
        price_source: 'crowdsourced' as const,
        last_updated: new Date().toISOString(),
        confidence_score: 0.7,
      }));
    }

    return routeData.results.map((r) => ({
      provider: r.provider,
      vehicle_type: r.vehicle_type,
      price_min: r.price_min,
      price_max: r.price_max,
      currency: r.currency,
      deeplink: r.deeplink,
      price_source: r.price_source,
      last_updated: r.last_updated,
      confidence_score: r.confidence_score,
    })) as PriceResult[];
  }, []);

  const search = useCallback(async (params: RouteParams) => {
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    lastParamsRef.current = params;

    setIsLoading(true);
    setError(null);
    setIsOfflineData(false);
    setCacheAge(null);

    const { from_label, to_label } = params;

    // Sauvegarder dans les recherches récentes
    addRecentSearch({
      from: from_label,
      to: to_label,
      timestamp: Date.now(),
    });

    // Si hors ligne, utiliser le cache ou les données locales
    if (isOffline) {
      const cached = await getCachedPrices(from_label, to_label);
      
      if (cached) {
        setLocalPrices(cached.data);
        setIsOfflineData(true);
        setCacheAge(cached.age);
      } else {
        // Utiliser les données locales statiques
        const localData = loadLocalPrices(from_label, to_label);
        setLocalPrices(localData);
        setIsOfflineData(true);
      }
      
      setIsLoading(false);
      return;
    }

    try {
      // Essayer l'API avec retry
      await retryWithBackoff(
        async () => {
          await dispatch(fetchPrices(params)).unwrap();
        },
        TIMING.maxRetries,
        TIMING.retryDelay
      );

      // Mettre en cache les résultats
      if (results.length > 0) {
        await setCachedPrices(from_label, to_label, results);
      }
    } catch (err: any) {
      // En cas d'échec API, utiliser le cache ou les données locales
      const cached = await getCachedPrices(from_label, to_label);
      
      if (cached) {
        setLocalPrices(cached.data);
        setIsOfflineData(true);
        setCacheAge(cached.age);
        setError(MESSAGES.offline.hint(cached.age));
      } else {
        // Utiliser les données locales statiques
        const localData = loadLocalPrices(from_label, to_label);
        setLocalPrices(localData);
        setIsOfflineData(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, isOffline, getCachedPrices, setCachedPrices, addRecentSearch, loadLocalPrices, results]);

  const refresh = useCallback(async () => {
    if (lastParamsRef.current) {
      await search(lastParamsRef.current);
    }
  }, [search]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Nettoyer l'abort controller au démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Utiliser les résultats Redux s'ils existent, sinon les locaux
  const prices = results.length > 0 ? results : localPrices;

  return {
    prices,
    isLoading: isLoading || reduxLoading,
    error: error || reduxError,
    isOfflineData,
    cacheAge,
    search,
    refresh,
    clearError,
  };
};

export default usePrices;
