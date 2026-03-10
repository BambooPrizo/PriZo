import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import authService from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Thunk pour la connexion
export const login = createAsyncThunk(
  'auth/login',
  async ({ phone, password }: { phone: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(phone, password);
      // Stocker le token de manière sécurisée
      await SecureStore.setItemAsync('auth_token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Identifiants incorrects');
    }
  }
);

// Thunk pour l'inscription
export const register = createAsyncThunk(
  'auth/register',
  async (
    { phone, password, name }: { phone: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.register(phone, password, name);
      await SecureStore.setItemAsync('auth_token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || "Erreur d'inscription");
    }
  }
);

// Thunk pour la déconnexion
export const logout = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('auth_token');
  return null;
});

// Thunk pour restaurer la session
export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      // TODO: Appeler l'API pour récupérer les infos utilisateur
      return { token };
    }
    return null;
  } catch (error) {
    return rejectWithValue('Erreur de restauration de session');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    });

    // Restore session
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      if (action.payload) {
        state.token = action.payload.token;
      }
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
