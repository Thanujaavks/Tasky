import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;
  const host = hostUri?.split(':')[0];

  return `http://${host || 'localhost'}:5000/api`;
};

const BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT_MS = 15000;

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (method: string, path: string, body?: object) => {
  const headers = await getHeaders();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      signal: controller.signal,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Could not reach API at ${BASE_URL}. Check that the backend is running and reachable from your device.`);
    }
    throw new Error(`Network request failed. Check that the backend is running at ${BASE_URL}.`);
  } finally {
    clearTimeout(timeout);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('POST', '/auth/login', { email, password }),
  getMe: () => request('GET', '/auth/me'),

  // Tasks
  getTasks: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/tasks${qs}`);
  },
  getTask: (id: number) => request('GET', `/tasks/${id}`),
  createTask: (data: object) => request('POST', '/tasks', data),
  updateTask: (id: number, data: object) => request('PUT', `/tasks/${id}`, data),
  updateTaskStatus: (id: number, status: string) =>
    request('PATCH', `/tasks/${id}/status`, { status }),
  deleteTask: (id: number) => request('DELETE', `/tasks/${id}`),
  addComment: (id: number, comment: string) =>
    request('POST', `/tasks/${id}/comments`, { comment }),
  getStats: () => request('GET', '/tasks/stats'),

  // Users
  getEmployees: () => request('GET', '/users/employees'),
  getEmployee: (id: number) => request('GET', `/users/employees/${id}`),
  createEmployee: (data: object) => request('POST', '/users/employees', data),
  updateEmployee: (id: number, data: object) =>
    request('PUT', `/users/employees/${id}`, data),
  deleteEmployee: (id: number) => request('DELETE', `/users/employees/${id}`),
  updateProfile: (data: object) => request('PUT', '/users/profile', data),
};
