// ============================================
// COMPOSANT TRIPEARCHFORM - FORMULAIRE DE RECHERCHE DE TRAJET
// ============================================

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaceDetails, PlaceAutocompleteResult, calculateHaversineDistance } from '../utils/geocoding';
import { usePlacesSearch } from '../hooks/usePlacesSearch';
import { useLocation } from '../hooks/useLocation';

// ============================================
// TYPES
// ============================================

interface TripSearchFormProps {
  onCompare: (departure: PlaceDetails, destination: PlaceDetails) => void;
  currentLocation?: { lat: number; lng: number } | null;
}

type FieldType = 'departure' | 'destination' | null;

// Mapping des types Google Places vers icônes
const PLACE_TYPE_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '🍽️',
  hospital: '🏥',
  pharmacy: '🏥',
  school: '🎓',
  university: '🎓',
  shopping_mall: '🛍️',
  store: '🛍️',
  airport: '✈️',
  transit_station: '🚌',
  bus_station: '🚌',
  lodging: '🏨',
  church: '🛐',
  mosque: '🛐',
  bank: '🏦',
  atm: '🏦',
  park: '🌳',
  default: '📍',
};

const getPlaceIcon = (types?: string[]): string => {
  if (!types) return PLACE_TYPE_ICONS.default;
  for (const type of types) {
    if (PLACE_TYPE_ICONS[type]) {
      return PLACE_TYPE_ICONS[type];
    }
  }
  return PLACE_TYPE_ICONS.default;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const TripSearchForm: React.FC<TripSearchFormProps> = ({ onCompare, currentLocation }) => {
  // State principal
  const [departure, setDeparture] = useState<PlaceDetails | null>(null);
  const [destination, setDestination] = useState<PlaceDetails | null>(null);
  const [activeField, setActiveField] = useState<FieldType>(null);
  const [departureQuery, setDepartureQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');

  // Refs pour les inputs
  const departureInputRef = useRef<TextInput>(null);
  const destinationInputRef = useRef<TextInput>(null);

  // Animations
  const swapRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const suggestionsOpacity = useRef(new Animated.Value(0)).current;
  const suggestionsTranslate = useRef(new Animated.Value(-8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Hook de localisation
  const { coords, address, loading: isLocating, getCurrentPosition } = useLocation({
    reverseGeocode: true,
  });

  // Hook de recherche Places
  const {
    results,
    loading: searchLoading,
    setQuery: setSearchQuery,
    selectPlace,
    clearSelection,
  } = usePlacesSearch({ preferLocal: true });

  // ============================================
  // GÉOLOCALISATION AUTOMATIQUE
  // ============================================

  useEffect(() => {
    getCurrentPosition();
  }, []);

  useEffect(() => {
    if (coords && address && !departure) {
      setDeparture({
        placeId: 'current_location',
        name: address.name || 'Ma position actuelle',
        address: address.address || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
        lat: coords.latitude,
        lng: coords.longitude,
        types: ['current_location'],
      });
    }
  }, [coords, address, departure]);

  // ============================================
  // ANIMATION PULSE GÉOLOCALISATION
  // ============================================

  useEffect(() => {
    if (isLocating) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLocating, pulseAnim]);

  // ============================================
  // ANIMATION SUGGESTIONS
  // ============================================

  useEffect(() => {
    if (results.length > 0 && activeField) {
      Animated.parallel([
        Animated.timing(suggestionsOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(suggestionsTranslate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(suggestionsOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(suggestionsTranslate, {
          toValue: -8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [results.length, activeField, suggestionsOpacity, suggestionsTranslate]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSwap = useCallback(() => {
    Animated.timing(swapRotation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      swapRotation.setValue(0);
    });

    const temp = departure;
    setDeparture(destination);
    setDestination(temp);

    // Swap queries too
    const tempQuery = departureQuery;
    setDepartureQuery(destinationQuery);
    setDestinationQuery(tempQuery);
  }, [departure, destination, departureQuery, destinationQuery, swapRotation]);

  const handleDepartureChange = useCallback((text: string) => {
    setDepartureQuery(text);
    if (departure) {
      setDeparture(null);
    }
    if (text.length >= 2) {
      setSearchQuery(text);
    } else {
      clearSelection();
    }
  }, [departure, setSearchQuery, clearSelection]);

  const handleDestinationChange = useCallback((text: string) => {
    setDestinationQuery(text);
    if (destination) {
      setDestination(null);
    }
    if (text.length >= 2) {
      setSearchQuery(text);
    } else {
      clearSelection();
    }
  }, [destination, setSearchQuery, clearSelection]);

  const handleSuggestionPress = useCallback(async (suggestion: PlaceAutocompleteResult) => {
    const details = await selectPlace(suggestion.placeId);
    if (details) {
      if (activeField === 'departure') {
        setDeparture(details);
        setDepartureQuery('');
      } else if (activeField === 'destination') {
        setDestination(details);
        setDestinationQuery('');
      }
      setActiveField(null);
      clearSelection();
      Keyboard.dismiss();
    }
  }, [activeField, selectPlace, clearSelection]);

  const handleClearDeparture = useCallback(() => {
    setDeparture(null);
    setDepartureQuery('');
    clearSelection();
  }, [clearSelection]);

  const handleClearDestination = useCallback(() => {
    setDestination(null);
    setDestinationQuery('');
    clearSelection();
  }, [clearSelection]);

  const handleRequestLocation = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  const handleComparePress = useCallback(() => {
    if (!departure || !destination) return;

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onCompare(departure, destination);
  }, [departure, destination, onCompare, buttonScale]);

  const handleFieldFocus = useCallback((field: FieldType) => {
    setActiveField(field);
    if (field === 'departure') {
      setSearchQuery(departureQuery);
    } else if (field === 'destination') {
      setSearchQuery(destinationQuery);
    }
  }, [departureQuery, destinationQuery, setSearchQuery]);

  const handleFieldBlur = useCallback(() => {
    setTimeout(() => {
      setActiveField(null);
      clearSelection();
    }, 200);
  }, [clearSelection]);

  // ============================================
  // CALCUL DISTANCE POUR SUGGESTIONS
  // ============================================

  const getDistanceText = useCallback((suggestion: PlaceAutocompleteResult): string => {
    const userLat = currentLocation?.lat || coords?.latitude;
    const userLng = currentLocation?.lng || coords?.longitude;
    
    if (!userLat || !userLng) return '';
    
    // Estimation basée sur la description (pas de coordonnées précises)
    // Dans la vraie app, on utiliserait les coordonnées de la suggestion
    return '';
  }, [currentLocation, coords]);

  // ============================================
  // ROTATION INTERPOLATION
  // ============================================

  const rotateInterpolation = swapRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // ============================================
  // ÉTATS DES CHAMPS
  // ============================================

  const isButtonActive = departure && destination;
  const showSuggestions = results.length > 0 && activeField;

  // ============================================
  // RENDER SUGGESTION ITEM
  // ============================================

  const renderSuggestionItem = useCallback(({ item, index }: { item: PlaceAutocompleteResult; index: number }) => {
    const query = activeField === 'departure' ? departureQuery : destinationQuery;
    const mainText = item.mainText;
    const secondaryText = item.secondaryText;
    
    // Highlight text matching query
    const highlightText = (text: string, query: string) => {
      if (!query) return <Text style={styles.suggestionMainText}>{text}</Text>;
      
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const index = lowerText.indexOf(lowerQuery);
      
      if (index === -1) return <Text style={styles.suggestionMainText}>{text}</Text>;
      
      return (
        <Text style={styles.suggestionMainText}>
          {text.substring(0, index)}
          <Text style={styles.suggestionHighlight}>
            {text.substring(index, index + query.length)}
          </Text>
          {text.substring(index + query.length)}
        </Text>
      );
    };

    return (
      <TouchableOpacity
        style={[
          styles.suggestionItem,
          index < Math.min(results.length - 1, 4) && styles.suggestionItemBorder,
        ]}
        onPress={() => handleSuggestionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.suggestionIconContainer}>
          <Text style={styles.suggestionIcon}>{getPlaceIcon(item.types)}</Text>
        </View>
        <View style={styles.suggestionTextContainer}>
          {highlightText(mainText, query)}
          <Text style={styles.suggestionSecondaryText} numberOfLines={1}>
            {secondaryText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [activeField, departureQuery, destinationQuery, handleSuggestionPress, results.length]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <View style={styles.container}>
      {/* Label de section */}
      <Text style={styles.sectionLabel}>RECHERCHER UN TRAJET</Text>

      {/* Carte principale */}
      <View style={styles.card}>
        {/* Ligne de connexion verticale */}
        <View style={styles.connectionLine} />

        {/* Bouton Swap */}
        <TouchableOpacity
          style={styles.swapButton}
          onPress={handleSwap}
          activeOpacity={0.8}
          accessibilityLabel="Inverser le départ et l'arrivée"
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <Ionicons name="swap-vertical" size={18} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>

        {/* Champ Départ */}
        <TouchableOpacity
          style={[
            styles.fieldContainer,
            activeField === 'departure' && styles.fieldContainerFocused,
          ]}
          onPress={() => {
            handleFieldFocus('departure');
            departureInputRef.current?.focus();
          }}
          activeOpacity={1}
          accessibilityLabel={
            departure
              ? `Point de départ : ${departure.name}`
              : "Champ point de départ, appuyez pour saisir"
          }
        >
          {/* Icône de statut */}
          <View style={styles.iconContainer}>
            {isLocating ? (
              <Animated.View
                style={[
                  styles.departureIcon,
                  styles.departureIconFilled,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
            ) : departure ? (
              <View style={[styles.departureIcon, styles.departureIconFilled]} />
            ) : (
              <View style={[styles.departureIcon, styles.departureIconOutline]} />
            )}
          </View>

          {/* Contenu central */}
          <View style={styles.fieldContent}>
            {isLocating ? (
              <Text style={styles.locatingText}>Détection de votre position...</Text>
            ) : departure ? (
              <>
                <Text style={styles.fieldName}>{departure.name}</Text>
                <Text style={styles.fieldAddress} numberOfLines={1}>
                  {departure.address}
                </Text>
              </>
            ) : activeField === 'departure' ? (
              <TextInput
                ref={departureInputRef}
                style={styles.fieldInput}
                placeholder="Point de départ"
                placeholderTextColor="#475569"
                value={departureQuery}
                onChangeText={handleDepartureChange}
                onFocus={() => handleFieldFocus('departure')}
                onBlur={handleFieldBlur}
                autoCorrect={false}
                cursorColor="#F97316"
              />
            ) : (
              <Text style={styles.fieldPlaceholder}>Point de départ</Text>
            )}
          </View>

          {/* Côté droit */}
          <View style={styles.fieldRight}>
            {departure ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearDeparture}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={12} color="#64748B" />
              </TouchableOpacity>
            ) : !isLocating ? (
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleRequestLocation}
                accessibilityLabel="Détecter ma position automatiquement"
              >
                <Ionicons name="locate" size={20} color="#F97316" />
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="small" color="#F97316" />
            )}
          </View>
        </TouchableOpacity>

        {/* Suggestions départ */}
        {showSuggestions && activeField === 'departure' && (
          <Animated.View
            style={[
              styles.suggestionsContainer,
              {
                opacity: suggestionsOpacity,
                transform: [{ translateY: suggestionsTranslate }],
              },
            ]}
          >
            <View style={styles.suggestionsSeparator} />
            <FlatList
              data={results.slice(0, 5)}
              keyExtractor={(item) => item.placeId}
              renderItem={renderSuggestionItem}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={false}
            />
          </Animated.View>
        )}

        {/* Séparateur */}
        <View style={styles.separator} />

        {/* Champ Arrivée */}
        <TouchableOpacity
          style={[
            styles.fieldContainer,
            activeField === 'destination' && styles.fieldContainerFocused,
          ]}
          onPress={() => {
            handleFieldFocus('destination');
            destinationInputRef.current?.focus();
          }}
          activeOpacity={1}
          accessibilityLabel={
            destination
              ? `Destination : ${destination.name}`
              : "Champ destination, appuyez pour saisir"
          }
        >
          {/* Icône de statut */}
          <View style={styles.iconContainer}>
            {destination ? (
              <View style={[styles.destinationIcon, styles.destinationIconFilled]} />
            ) : (
              <View style={[styles.destinationIcon, styles.destinationIconOutline]} />
            )}
          </View>

          {/* Contenu central */}
          <View style={styles.fieldContent}>
            {destination ? (
              <>
                <Text style={styles.fieldName}>{destination.name}</Text>
                <Text style={styles.fieldAddress} numberOfLines={1}>
                  {destination.address}
                </Text>
              </>
            ) : activeField === 'destination' ? (
              <TextInput
                ref={destinationInputRef}
                style={styles.fieldInput}
                placeholder="Où allez-vous ?"
                placeholderTextColor="#475569"
                value={destinationQuery}
                onChangeText={handleDestinationChange}
                onFocus={() => handleFieldFocus('destination')}
                onBlur={handleFieldBlur}
                autoCorrect={false}
                cursorColor="#F97316"
              />
            ) : (
              <Text style={styles.fieldPlaceholder}>Où allez-vous ?</Text>
            )}
          </View>

          {/* Côté droit */}
          <View style={styles.fieldRight}>
            {destination && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearDestination}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={12} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {/* Suggestions destination */}
        {showSuggestions && activeField === 'destination' && (
          <Animated.View
            style={[
              styles.suggestionsContainer,
              {
                opacity: suggestionsOpacity,
                transform: [{ translateY: suggestionsTranslate }],
              },
            ]}
          >
            <View style={styles.suggestionsSeparator} />
            <FlatList
              data={results.slice(0, 5)}
              keyExtractor={(item) => item.placeId}
              renderItem={renderSuggestionItem}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={false}
            />
          </Animated.View>
        )}
      </View>

      {/* Bouton Comparer */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[
            styles.compareButton,
            isButtonActive ? styles.compareButtonActive : styles.compareButtonDisabled,
          ]}
          onPress={handleComparePress}
          disabled={!isButtonActive}
          activeOpacity={0.8}
          accessibilityLabel={
            isButtonActive
              ? `Comparer les prix de ${departure?.name} à ${destination?.name}`
              : "Remplissez les deux champs pour comparer"
          }
        >
          <Text
            style={[
              styles.compareButtonText,
              isButtonActive ? styles.compareButtonTextActive : styles.compareButtonTextDisabled,
            ]}
          >
            Comparer les prix
          </Text>
          {isButtonActive && (
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.compareButtonIcon} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  
  // Label de section
  sectionLabel: {
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // Carte principale
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 0,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Ligne de connexion verticale
  connectionLine: {
    position: 'absolute',
    left: 25,
    top: 35,
    width: 1,
    height: 70,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    borderStyle: 'dashed',
  },

  // Bouton Swap
  swapButton: {
    position: 'absolute',
    right: -20,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  // Conteneur de champ
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    paddingVertical: 14,
  },

  fieldContainerFocused: {
    backgroundColor: '#FFF7ED',
  },

  // Icône container
  iconContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icône départ
  departureIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  departureIconFilled: {
    backgroundColor: '#22C55E',
  },

  departureIconOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#22C55E',
  },

  // Icône destination
  destinationIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  destinationIconFilled: {
    backgroundColor: '#EF4444',
  },

  destinationIconOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },

  // Contenu du champ
  fieldContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },

  fieldName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },

  fieldAddress: {
    fontSize: 12,
    color: '#64748B',
  },

  fieldPlaceholder: {
    fontSize: 15,
    color: '#94A3B8',
  },

  fieldInput: {
    fontSize: 15,
    color: '#1E293B',
    padding: 0,
    margin: 0,
  },

  locatingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#F97316',
  },

  // Côté droit
  fieldRight: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Séparateur
  separator: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderStyle: 'dashed',
  },

  // Suggestions
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
  },

  suggestionsSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },

  suggestionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  suggestionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  suggestionIcon: {
    fontSize: 16,
  },

  suggestionTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  suggestionMainText: {
    fontSize: 14,
    color: '#1E293B',
  },

  suggestionHighlight: {
    fontWeight: '700',
    color: '#F97316',
  },

  suggestionSecondaryText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Bouton Comparer
  compareButton: {
    marginTop: 16,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  compareButtonActive: {
    backgroundColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  compareButtonDisabled: {
    backgroundColor: '#F1F5F9',
  },

  compareButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },

  compareButtonTextActive: {
    color: '#FFFFFF',
  },

  compareButtonTextDisabled: {
    color: '#94A3B8',
  },

  compareButtonIcon: {
    marginLeft: 8,
  },
});

export default TripSearchForm;
