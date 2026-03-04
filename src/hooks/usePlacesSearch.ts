// ============================================
// HOOK DE RECHERCHE DE LIEUX
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  searchPlacesAutocomplete, 
  getPlaceDetails,
  PlaceAutocompleteResult,
  PlaceDetails,
} from '../utils/geocoding';
import { searchLocalPlaces } from '../constants/abidjanPlaces';
import { debounce } from '../utils';

// ============================================
// INTERFACES
// ============================================

export interface PlacesSearchState {
  query: string;
  results: PlaceAutocompleteResult[];
  loading: boolean;
  error: string | null;
  selectedPlace: PlaceDetails | null;
}

export interface UsePlacesSearchOptions {
  minQueryLength?: number;
  debounceMs?: number;
  maxResults?: number;
  preferLocal?: boolean; // Préférer les résultats locaux
}

// ============================================
// HOOK usePlacesSearch
// ============================================

export const usePlacesSearch = (options: UsePlacesSearchOptions = {}) => {
  const {
    minQueryLength = 2,
    debounceMs = 300,
    maxResults = 10,
    preferLocal = true,
  } = options;

  const [state, setState] = useState<PlacesSearchState>({
    query: '',
    results: [],
    loading: false,
    error: null,
    selectedPlace: null,
  });

  // ============================================
  // FONCTION DE RECHERCHE
  // ============================================

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < minQueryLength) {
      setState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let results: PlaceAutocompleteResult[] = [];

      if (preferLocal) {
        // Rechercher d'abord dans la base locale
        const localPlaces = searchLocalPlaces(query, maxResults);
        const localResults: PlaceAutocompleteResult[] = localPlaces.map(place => ({
          placeId: `local_${place.id}`,
          mainText: place.name,
          secondaryText: place.address,
          description: `${place.name}, ${place.address}`,
          types: [place.category],
        }));

        // Compléter avec Google Places si pas assez de résultats
        if (localResults.length < maxResults) {
          const apiResults = await searchPlacesAutocomplete(query);
          
          // Fusionner en évitant les doublons
          const combined = [...localResults];
          for (const apiResult of apiResults) {
            const isDuplicate = combined.some(
              r => r.mainText.toLowerCase() === apiResult.mainText.toLowerCase()
            );
            if (!isDuplicate && combined.length < maxResults) {
              combined.push(apiResult);
            }
          }
          results = combined;
        } else {
          results = localResults;
        }
      } else {
        // Utiliser directement Google Places
        results = await searchPlacesAutocomplete(query);
      }

      setState(prev => ({
        ...prev,
        results: results.slice(0, maxResults),
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('[usePlacesSearch] Erreur recherche:', error);
      setState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: 'Erreur lors de la recherche. Veuillez réessayer.',
      }));
    }
  }, [minQueryLength, maxResults, preferLocal]);

  // ============================================
  // RECHERCHE AVEC DEBOUNCE
  // ============================================

  const debouncedSearchRef = useRef(debounce(performSearch, debounceMs));

  useEffect(() => {
    debouncedSearchRef.current = debounce(performSearch, debounceMs);
  }, [performSearch, debounceMs]);

  // ============================================
  // METTRE À JOUR LA QUERY
  // ============================================

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
    debouncedSearchRef.current(query);
  }, []);

  // ============================================
  // SÉLECTIONNER UN LIEU
  // ============================================

  const selectPlace = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const details = await getPlaceDetails(placeId);

      if (details) {
        setState(prev => ({
          ...prev,
          selectedPlace: details,
          loading: false,
          results: [], // Vider les résultats après sélection
        }));
        return details;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Impossible de récupérer les détails du lieu.',
      }));
      return null;
    } catch (error) {
      console.error('[usePlacesSearch] Erreur select:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur lors de la sélection. Veuillez réessayer.',
      }));
      return null;
    }
  }, []);

  // ============================================
  // EFFACER LA SÉLECTION
  // ============================================

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      selectedPlace: null,
      error: null,
    }));
  }, []);

  // ============================================
  // EFFACER LES RÉSULTATS
  // ============================================

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
    }));
  }, []);

  // ============================================
  // RETOURNER L'API
  // ============================================

  return {
    ...state,
    setQuery,
    selectPlace,
    clearSelection,
    clearResults,
    hasResults: state.results.length > 0,
    hasSelection: state.selectedPlace !== null,
  };
};

export default usePlacesSearch;
