import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PriceResult, RouteParams } from '../types';
import pricesService from '../services/pricesService';

export type VehicleFilter = 'all' | 'moto' | 'standard' | 'premium';
export type SortType = 'price' | 'duration';

interface PricesState {
  results: PriceResult[];
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  activeFilter: VehicleFilter;
  sortBy: SortType;
}

const initialState: PricesState = {
  results: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  activeFilter: 'all',
  sortBy: 'price',
};

// Thunk pour récupérer les prix
export const fetchPrices = createAsyncThunk(
  'prices/fetch',
  async (params: RouteParams, { rejectWithValue }) => {
    try {
      const response = await pricesService.getPrices(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Erreur de récupération des prix'
      );
    }
  }
);

const pricesSlice = createSlice({
  name: 'prices',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<VehicleFilter>) => {
      state.activeFilter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortType>) => {
      state.sortBy = action.payload;
    },
    clearPrices: (state) => {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPrices.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPrices.fulfilled, (state, action) => {
      state.isLoading = false;
      state.results = action.payload.results;
      state.lastFetched = new Date().toISOString();
    });
    builder.addCase(fetchPrices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setFilter, setSortBy, clearPrices } = pricesSlice.actions;
export default pricesSlice.reducer;
