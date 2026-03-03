import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Alert } from '../types';
import alertsService, { CreateAlertParams } from '../services/alertsService';

interface AlertsState {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  alerts: [],
  isLoading: false,
  error: null,
};

// Thunk pour récupérer les alertes
export const fetchAlerts = createAsyncThunk('alerts/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await alertsService.getAlerts();
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error?.message || 'Erreur de récupération des alertes'
    );
  }
});

// Thunk pour créer une alerte
export const createAlert = createAsyncThunk(
  'alerts/create',
  async (params: CreateAlertParams, { rejectWithValue }) => {
    try {
      const response = await alertsService.createAlert(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Erreur de création de l'alerte"
      );
    }
  }
);

// Thunk pour supprimer une alerte
export const deleteAlert = createAsyncThunk(
  'alerts/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await alertsService.deleteAlert(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Erreur de suppression de l'alerte"
      );
    }
  }
);

// Thunk pour toggle une alerte
export const toggleAlert = createAsyncThunk(
  'alerts/toggle',
  async ({ id, is_active }: { id: string; is_active: boolean }, { rejectWithValue }) => {
    try {
      const response = await alertsService.updateAlert(id, { is_active });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Erreur de mise à jour de l'alerte"
      );
    }
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearAlertsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch alerts
    builder.addCase(fetchAlerts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAlerts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.alerts = action.payload;
    });
    builder.addCase(fetchAlerts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create alert
    builder.addCase(createAlert.fulfilled, (state, action) => {
      state.alerts.push(action.payload);
    });

    // Delete alert
    builder.addCase(deleteAlert.fulfilled, (state, action) => {
      state.alerts = state.alerts.filter((alert) => alert.id !== action.payload);
    });

    // Toggle alert
    builder.addCase(toggleAlert.fulfilled, (state, action) => {
      const index = state.alerts.findIndex((alert) => alert.id === action.payload.id);
      if (index !== -1) {
        state.alerts[index] = action.payload;
      }
    });
  },
});

export const { clearAlertsError } = alertsSlice.actions;
export default alertsSlice.reducer;
