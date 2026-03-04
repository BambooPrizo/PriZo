// ============================================
// COMPOSANT INPUT DE RECHERCHE DE LIEU
// ============================================

import React, { useCallback, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { usePlacesSearch } from '../hooks/usePlacesSearch';
import { PlaceSuggestionItem } from './PlaceSuggestionItem';
import { CurrentLocationButton } from './CurrentLocationButton';
import { COLORS, SPACING } from '../constants';
import { PlaceDetails, GeocodingResult, PlaceAutocompleteResult } from '../utils/geocoding';

// ============================================
// INTERFACES
// ============================================

interface LocationSearchInputProps {
  label: string;
  placeholder?: string;
  value: PlaceDetails | null;
  onPlaceSelected: (place: PlaceDetails) => void;
  onCurrentLocationSelected?: (location: {
    coords: { latitude: number; longitude: number };
    address: GeocodingResult | null;
  }) => void;
  showCurrentLocation?: boolean;
  icon?: string;
  testID?: string;
}

// ============================================
// COMPOSANT
// ============================================

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  label,
  placeholder = 'Rechercher un lieu...',
  value,
  onPlaceSelected,
  onCurrentLocationSelected,
  showCurrentLocation = true,
  icon = '📍',
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const {
    query,
    results,
    loading,
    error,
    setQuery,
    selectPlace,
    clearSelection,
    hasResults,
  } = usePlacesSearch({ preferLocal: true });

  // ============================================
  // GÉRER LA SÉLECTION D'UN LIEU
  // ============================================

  const handleSuggestionPress = useCallback(async (suggestion: PlaceAutocompleteResult) => {
    const details = await selectPlace(suggestion.placeId);
    if (details) {
      onPlaceSelected(details);
      Keyboard.dismiss();
    }
  }, [selectPlace, onPlaceSelected]);

  // ============================================
  // GÉRER LA POSITION ACTUELLE
  // ============================================

  const handleCurrentLocation = useCallback((location: {
    coords: { latitude: number; longitude: number };
    address: GeocodingResult | null;
  }) => {
    if (onCurrentLocationSelected) {
      onCurrentLocationSelected(location);
    }
    
    // Convertir en PlaceDetails
    const placeDetails: PlaceDetails = {
      placeId: 'current_location',
      name: location.address?.name || 'Ma position',
      address: location.address?.address || `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`,
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      types: ['current_location'],
    };
    
    onPlaceSelected(placeDetails);
    setQuery('');
    Keyboard.dismiss();
  }, [onCurrentLocationSelected, onPlaceSelected, setQuery]);

  // ============================================
  // EFFACER L'INPUT
  // ============================================

  const handleClear = useCallback(() => {
    setQuery('');
    clearSelection();
  }, [setQuery, clearSelection]);

  // ============================================
  // AFFICHER LE LIEU SÉLECTIONNÉ
  // ============================================

  const displayValue = value?.name || query;

  // ============================================
  // RENDER
  // ============================================

  return (
    <View style={styles.container} testID={testID}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>
      
      {/* Input avec bouton GPS */}
      <View style={styles.inputRow}>
        <View style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          value && styles.inputSelected,
        ]}>
          <Text style={styles.inputIcon}>{icon}</Text>
          
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            value={displayValue}
            onChangeText={(text) => {
              if (value) {
                clearSelection();
              }
              setQuery(text);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
            returnKeyType="search"
            autoCorrect={false}
          />
          
          {loading && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
          
          {(displayValue.length > 0 && !loading) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showCurrentLocation && (
          <CurrentLocationButton
            onLocationFound={handleCurrentLocation}
            compact
            style={styles.gpsButton}
          />
        )}
      </View>
      
      {/* Message d'erreur */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {/* Liste des suggestions */}
      {hasResults && isFocused && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <PlaceSuggestionItem
                suggestion={item}
                onPress={handleSuggestionPress}
              />
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
            ListHeaderComponent={
              <Text style={styles.suggestionsHeader}>
                Suggestions ({results.length})
              </Text>
            }
          />
        </View>
      )}
      
      {/* Lieu sélectionné */}
      {value && !isFocused && (
        <View style={styles.selectedPlace}>
          <Text style={styles.selectedAddress} numberOfLines={1}>
            {value.address}
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    height: 48,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputSelected: {
    borderColor: COLORS.success || '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearIcon: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  gpsButton: {
    marginLeft: 0,
  },
  errorText: {
    color: COLORS.error || '#EF4444',
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 76,
    left: 0,
    right: 56,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surface,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  suggestionsList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionsHeader: {
    color: COLORS.textSecondary,
    fontSize: 12,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  selectedPlace: {
    marginTop: SPACING.xs,
  },
  selectedAddress: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default LocationSearchInput;
