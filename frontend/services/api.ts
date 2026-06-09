import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.100:5000/api'; // Update to your machine's IP

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (method: string, path: string, body?: object) => {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
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
