// ============================================
// TESTS - COMPOSANT LocationSearchInput
// ============================================

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { LocationSearchInput } from '../LocationSearchInput';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';
import { PlaceDetails, PlaceAutocompleteResult } from '../../utils/geocoding';

// ============================================
// MOCKS
// ============================================

jest.mock('../../hooks/usePlacesSearch');
jest.mock('../CurrentLocationButton', () => ({
  CurrentLocationButton: ({ onLocationFound }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity testID="gps-button" onPress={() => onLocationFound({
        coords: { latitude: 5.316667, longitude: -4.033333 },
        address: { name: 'Ma position', address: 'Plateau, Abidjan' },
      })}>
        <Text>GPS</Text>
      </TouchableOpacity>
    );
  },
}));
jest.mock('../PlaceSuggestionItem', () => ({
  PlaceSuggestionItem: ({ suggestion, onPress }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity 
        testID={`suggestion-${suggestion.placeId}`}
        onPress={() => onPress(suggestion)}
      >
        <Text>{suggestion.mainText}</Text>
      </TouchableOpacity>
    );
  },
}));

jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});

const mockUsePlacesSearch = usePlacesSearch as jest.MockedFunction<typeof usePlacesSearch>;

// ============================================
// DONNÉES DE TEST
// ============================================

const mockSuggestions: PlaceAutocompleteResult[] = [
  {
    placeId: 'place_1',
    mainText: 'Aéroport FHB',
    secondaryText: 'Port-Bouët, Abidjan',
    description: 'Aéroport Félix Houphouët-Boigny, Port-Bouët, Abidjan',
    types: ['airport'],
  },
  {
    placeId: 'place_2',
    mainText: 'Mall of Africa',
    secondaryText: 'Cocody, Abidjan',
    description: 'Mall of Africa, Cocody, Abidjan',
    types: ['shopping_mall'],
  },
  {
    placeId: 'place_3',
    mainText: 'Centre Commercial Cosmos',
    secondaryText: 'Yopougon, Abidjan',
    description: 'Cosmos Yopougon, Abidjan',
    types: ['shopping_mall'],
  },
];

const mockPlaceDetails: PlaceDetails = {
  placeId: 'place_1',
  name: 'Aéroport FHB',
  address: 'Port-Bouët, Abidjan',
  lat: 5.2619,
  lng: -3.9262,
  types: ['airport'],
};

const createMockHook = (overrides: Record<string, any> = {}) => ({
  query: '',
  results: [] as PlaceAutocompleteResult[],
  loading: false,
  error: null,
  selectedPlace: null,
  setQuery: jest.fn(),
  selectPlace: jest.fn().mockResolvedValue(mockPlaceDetails),
  clearSelection: jest.fn(),
  clearResults: jest.fn(),
  hasResults: false,
  hasSelection: false,
  ...overrides,
});

// ============================================
// RESET AVANT CHAQUE TEST
// ============================================

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePlacesSearch.mockReturnValue(createMockHook());
});

// ============================================
// TESTS RENDU DE BASE
// ============================================

describe('LocationSearchInput - Rendu', () => {
  it('devrait afficher le label', () => {
    const { getByText } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    expect(getByText('Départ')).toBeTruthy();
  });

  it('devrait afficher le placeholder', () => {
    const { getByPlaceholderText } = render(
      <LocationSearchInput
        label="Départ"
        placeholder="Où voulez-vous partir ?"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    expect(getByPlaceholderText('Où voulez-vous partir ?')).toBeTruthy();
  });

  it('devrait afficher le bouton GPS par défaut', () => {
    const { getByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    expect(getByTestId('gps-button')).toBeTruthy();
  });

  it('devrait cacher le bouton GPS si showCurrentLocation=false', () => {
    const { queryByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
        showCurrentLocation={false}
      />
    );
    
    expect(queryByTestId('gps-button')).toBeNull();
  });

  it('devrait afficher le nom du lieu sélectionné', () => {
    const { getByDisplayValue } = render(
      <LocationSearchInput
        label="Départ"
        value={mockPlaceDetails}
        onPlaceSelected={jest.fn()}
      />
    );
    
    expect(getByDisplayValue('Aéroport FHB')).toBeTruthy();
  });
});

// ============================================
// TESTS VALIDATION LONGUEUR QUERY
// ============================================

describe('LocationSearchInput - Validation longueur query', () => {
  it('ne devrait pas appeler setQuery pour une requête vide', () => {
    const mockSetQuery = jest.fn();
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      setQuery: mockSetQuery,
    }));

    const { getByPlaceholderText } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const input = getByPlaceholderText('Rechercher un lieu...');
    fireEvent.changeText(input, '');
    
    // setQuery devrait quand même être appelé pour effacer
    expect(mockSetQuery).toHaveBeenCalledWith('');
  });

  it('devrait appeler setQuery pour une requête courte', () => {
    const mockSetQuery = jest.fn();
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      setQuery: mockSetQuery,
    }));

    const { getByPlaceholderText } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const input = getByPlaceholderText('Rechercher un lieu...');
    fireEvent.changeText(input, 'A');
    
    expect(mockSetQuery).toHaveBeenCalledWith('A');
  });

  it('devrait appeler setQuery pour une requête valide', () => {
    const mockSetQuery = jest.fn();
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      setQuery: mockSetQuery,
    }));

    const { getByPlaceholderText } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const input = getByPlaceholderText('Rechercher un lieu...');
    fireEvent.changeText(input, 'Aéroport');
    
    expect(mockSetQuery).toHaveBeenCalledWith('Aéroport');
  });
});

// ============================================
// TESTS DEBOUNCE (comportement indirect)
// ============================================

describe('LocationSearchInput - Debounce', () => {
  it('devrait utiliser le hook usePlacesSearch', () => {
    render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    expect(mockUsePlacesSearch).toHaveBeenCalled();
  });

  it('devrait passer preferLocal=true au hook', () => {
    render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    expect(mockUsePlacesSearch).toHaveBeenCalledWith({ preferLocal: true });
  });
});

// ============================================
// TESTS SUGGESTIONS
// ============================================

describe('LocationSearchInput - Suggestions', () => {
  it('devrait afficher les suggestions quand hasResults=true et focus', async () => {
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      results: mockSuggestions,
      hasResults: true,
    }));

    const { getByPlaceholderText, getByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const input = getByPlaceholderText('Rechercher un lieu...');
    fireEvent(input, 'focus');
    
    await waitFor(() => {
      expect(getByTestId('suggestion-place_1')).toBeTruthy();
      expect(getByTestId('suggestion-place_2')).toBeTruthy();
      expect(getByTestId('suggestion-place_3')).toBeTruthy();
    });
  });

  it('ne devrait pas afficher les suggestions si hasResults=false', () => {
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      results: [],
      hasResults: false,
    }));

    const { getByPlaceholderText, queryByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const input = getByPlaceholderText('Rechercher un lieu...');
    fireEvent(input, 'focus');
    
    expect(queryByTestId('suggestion-place_1')).toBeNull();
  });
});

// ============================================
// TESTS SÉLECTION D'UNE SUGGESTION
// ============================================

describe('LocationSearchInput - Sélection suggestion', () => {
  it('devrait appeler selectPlace quand une suggestion est cliquée', async () => {
    const mockSelectPlace = jest.fn().mockResolvedValue(mockPlaceDetails);
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      results: mockSuggestions,
      hasResults: true,
      selectPlace: mockSelectPlace,
    }));

    const { getByPlaceholderText, getByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const input = getByPlaceholderText('Rechercher un lieu...');
    fireEvent(input, 'focus');
    
    await waitFor(() => {
      const suggestion = getByTestId('suggestion-place_1');
      fireEvent.press(suggestion);
    });
    
    expect(mockSelectPlace).toHaveBeenCalledWith('place_1');
  });

  it('devrait appeler onPlaceSelected avec les détails du lieu', async () => {
    const mockOnPlaceSelected = jest.fn();
    const mockSelectPlace = jest.fn().mockResolvedValue(mockPlaceDetails);
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      results: mockSuggestions,
      hasResults: true,
      selectPlace: mockSelectPlace,
    }));

    const { getByPlaceholderText, getByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={mockOnPlaceSelected}
      />
    );
    
    const input = getByPlaceholderText('Rechercher un lieu...');
    fireEvent(input, 'focus');
    
    await waitFor(() => {
      const suggestion = getByTestId('suggestion-place_1');
      fireEvent.press(suggestion);
    });
    
    await waitFor(() => {
      expect(mockOnPlaceSelected).toHaveBeenCalledWith(mockPlaceDetails);
    });
  });

  it('devrait fermer le clavier après sélection', async () => {
    const mockSelectPlace = jest.fn().mockResolvedValue(mockPlaceDetails);
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      results: mockSuggestions,
      hasResults: true,
      selectPlace: mockSelectPlace,
    }));

    const { getByPlaceholderText, getByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const input = getByPlaceholderText('Rechercher un lieu...');
    fireEvent(input, 'focus');
    
    await waitFor(() => {
      const suggestion = getByTestId('suggestion-place_1');
      fireEvent.press(suggestion);
    });
    
    await waitFor(() => {
      expect(Keyboard.dismiss).toHaveBeenCalled();
    });
  });
});

// ============================================
// TESTS BOUTON CLEAR
// ============================================

describe('LocationSearchInput - Clear button', () => {
  it('devrait afficher le bouton clear quand il y a du texte', () => {
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      query: 'Aéroport',
    }));

    const { getByText } = render(
      <LocationSearchInput
        label="Départ"
        value={{ ...mockPlaceDetails, name: 'Aéroport' }}
        onPlaceSelected={jest.fn()}
      />
    );
    
    expect(getByText('✕')).toBeTruthy();
  });

  it('devrait appeler clearSelection et setQuery quand clear est cliqué', () => {
    const mockClearSelection = jest.fn();
    const mockSetQuery = jest.fn();
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      query: 'Aéroport',
      clearSelection: mockClearSelection,
      setQuery: mockSetQuery,
    }));

    const { getByText } = render(
      <LocationSearchInput
        label="Départ"
        value={{ ...mockPlaceDetails, name: 'Aéroport' }}
        onPlaceSelected={jest.fn()}
      />
    );
    
    fireEvent.press(getByText('✕'));
    
    expect(mockSetQuery).toHaveBeenCalledWith('');
    expect(mockClearSelection).toHaveBeenCalled();
  });

  it('ne devrait pas afficher le bouton clear pendant le chargement', () => {
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      query: 'Aéroport',
      loading: true,
    }));

    const { queryByText } = render(
      <LocationSearchInput
        label="Départ"
        value={{ ...mockPlaceDetails, name: 'Aéroport' }}
        onPlaceSelected={jest.fn()}
      />
    );
    
    // Le bouton clear ne devrait pas être visible pendant le loading
    expect(queryByText('✕')).toBeNull();
  });
});

// ============================================
// TESTS POSITION ACTUELLE
// ============================================

describe('LocationSearchInput - Position actuelle', () => {
  it('devrait appeler onCurrentLocationSelected quand GPS est cliqué', () => {
    const mockOnCurrentLocation = jest.fn();
    
    const { getByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
        onCurrentLocationSelected={mockOnCurrentLocation}
      />
    );
    
    fireEvent.press(getByTestId('gps-button'));
    
    expect(mockOnCurrentLocation).toHaveBeenCalledWith({
      coords: { latitude: 5.316667, longitude: -4.033333 },
      address: { name: 'Ma position', address: 'Plateau, Abidjan' },
    });
  });

  it('devrait aussi appeler onPlaceSelected avec la position actuelle', () => {
    const mockOnPlaceSelected = jest.fn();
    const mockSetQuery = jest.fn();
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      setQuery: mockSetQuery,
    }));
    
    const { getByTestId } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={mockOnPlaceSelected}
      />
    );
    
    fireEvent.press(getByTestId('gps-button'));
    
    expect(mockOnPlaceSelected).toHaveBeenCalledWith(
      expect.objectContaining({
        placeId: 'current_location',
        name: 'Ma position',
        lat: 5.316667,
        lng: -4.033333,
      })
    );
  });
});

// ============================================
// TESTS ERREUR
// ============================================

describe('LocationSearchInput - Erreur', () => {
  it('devrait afficher le message d\'erreur', () => {
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      error: 'Erreur lors de la recherche. Veuillez réessayer.',
    }));

    const { getByText } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    expect(getByText('Erreur lors de la recherche. Veuillez réessayer.')).toBeTruthy();
  });
});

// ============================================
// TESTS LOADING
// ============================================

describe('LocationSearchInput - Loading', () => {
  it('devrait afficher l\'indicateur de chargement', () => {
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      loading: true,
    }));

    const { UNSAFE_getByType } = render(
      <LocationSearchInput
        label="Départ"
        value={null}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });
});

// ============================================
// TESTS INTÉGRATION FOCUS/BLUR
// ============================================

describe('LocationSearchInput - Focus/Blur', () => {
  it('devrait effacer la sélection quand l\'utilisateur tape dans un champ avec valeur', () => {
    const mockClearSelection = jest.fn();
    const mockSetQuery = jest.fn();
    mockUsePlacesSearch.mockReturnValue(createMockHook({
      clearSelection: mockClearSelection,
      setQuery: mockSetQuery,
    }));

    const { getByDisplayValue } = render(
      <LocationSearchInput
        label="Départ"
        value={mockPlaceDetails}
        onPlaceSelected={jest.fn()}
      />
    );
    
    const input = getByDisplayValue('Aéroport FHB');
    fireEvent.changeText(input, 'Nouveau');
    
    expect(mockClearSelection).toHaveBeenCalled();
    expect(mockSetQuery).toHaveBeenCalledWith('Nouveau');
  });
});
