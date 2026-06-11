import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
};

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const [token, userJson] = await Promise.all([
    AsyncStorage.getItem('token'),
    AsyncStorage.getItem('user'),
  ]);
  if (token && userJson) {
    return { token, user: JSON.parse(userJson) as User };
  }
  return null;
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const data = await api.login(email, password);
    await AsyncStorage.multiSet([
      ['token', data.token],
      ['user', JSON.stringify(data.user)],
    ]);
    return { token: data.token as string, user: data.user as User };
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
});

export const refreshUserThunk = createAsyncThunk('auth/refreshUser', async () => {
  const data = await api.getMe();
  const user = data.user as User;
  await AsyncStorage.setItem('user', JSON.stringify(user));
  return user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      })
      .addCase(refreshUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export default authSlice.reducer;
