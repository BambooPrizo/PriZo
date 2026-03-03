// ============================================
// HOOK - Cache AsyncStorage avec expiration
// ============================================

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TIMING, STORAGE_KEYS } from '../constants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseCacheReturn<T> {
  get: (key: string) => Promise<T | null>;
  set: (key: string, data: T, ttl?: number) => Promise<void>;
  remove: (key: string) => Promise<void>;
  isExpired: (key: string) => Promise<boolean>;
  getWithMetadata: (key: string) => Promise<{ data: T; age: number } | null>;
  clearAll: () => Promise<void>;
}

export function useCache<T>(): UseCacheReturn<T> {
  const get = useCallback(async (key: string): Promise<T | null> => {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Vérifier si expiré
      if (Date.now() > entry.expiresAt) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('[Cache] Erreur lecture:', error);
      return null;
    }
  }, []);

  const set = useCallback(async (key: string, data: T, ttl: number = TIMING.cacheExpiry): Promise<void> => {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('[Cache] Erreur écriture:', error);
    }
  }, []);

  const remove = useCallback(async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('[Cache] Erreur suppression:', error);
    }
  }, []);

  const isExpired = useCallback(async (key: string): Promise<boolean> => {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return true;

      const entry: CacheEntry<T> = JSON.parse(cached);
      return Date.now() > entry.expiresAt;
    } catch {
      return true;
    }
  }, []);

  const getWithMetadata = useCallback(async (key: string): Promise<{ data: T; age: number } | null> => {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Retourner même si expiré pour le mode offline
      const ageMs = Date.now() - entry.timestamp;
      const ageMinutes = Math.floor(ageMs / 60000);

      return {
        data: entry.data,
        age: ageMinutes,
      };
    } catch {
      return null;
    }
  }, []);

  const clearAll = useCallback(async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.warn('[Cache] Erreur vidage:', error);
    }
  }, []);

  return {
    get,
    set,
    remove,
    isExpired,
    getWithMetadata,
    clearAll,
  };
}

// Hook spécifique pour le cache des prix
export function usePriceCache() {
  const cache = useCache<any>();

  const getCachedPrices = useCallback(async (fromLabel: string, toLabel: string) => {
    const key = `${STORAGE_KEYS.cachedPrices}_${fromLabel}_${toLabel}`;
    return cache.getWithMetadata(key);
  }, [cache]);

  const setCachedPrices = useCallback(async (fromLabel: string, toLabel: string, prices: any) => {
    const key = `${STORAGE_KEYS.cachedPrices}_${fromLabel}_${toLabel}`;
    await cache.set(key, prices);
  }, [cache]);

  return {
    getCachedPrices,
    setCachedPrices,
  };
}

// Hook pour les recherches récentes
export function useRecentSearches() {
  const LIMIT = 10;

  const getRecentSearches = useCallback(async (): Promise<any[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.recentSearches);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }, []);

  const addRecentSearch = useCallback(async (search: { from: string; to: string; timestamp: number }) => {
    try {
      const searches = await getRecentSearches();
      
      // Éviter les doublons
      const filtered = searches.filter(
        s => !(s.from === search.from && s.to === search.to)
      );
      
      // Ajouter en tête et garder les N derniers
      const updated = [search, ...filtered].slice(0, LIMIT);
      await AsyncStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(updated));
    } catch (error) {
      console.warn('[RecentSearches] Erreur ajout:', error);
    }
  }, [getRecentSearches]);

  const clearRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.recentSearches);
    } catch (error) {
      console.warn('[RecentSearches] Erreur vidage:', error);
    }
  }, []);

  return {
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}

export default useCache;
