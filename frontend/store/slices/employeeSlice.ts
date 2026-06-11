import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { EmployeeStats, User } from '@/types';

interface EmployeeState {
  employees: EmployeeStats[];
  currentEmployee: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk('employees/fetchEmployees', async () => {
  const res = await api.getEmployees();
  return res.employees as EmployeeStats[];
});

export const fetchEmployee = createAsyncThunk('employees/fetchEmployee', async (id: number) => {
  const res = await api.getEmployee(id);
  return res.employee as User;
});

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (data: object) => {
    await api.createEmployee(data);
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, data }: { id: number; data: object }) => {
    await api.updateEmployee(id, data);
    const res = await api.getEmployee(id);
    return res.employee as User;
  }
);

export const deleteEmployee = createAsyncThunk('employees/deleteEmployee', async (id: number) => {
  await api.deleteEmployee(id);
  return id;
});

export const updateProfile = createAsyncThunk(
  'employees/updateProfile',
  async (data: object) => {
    await api.updateProfile(data);
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearCurrentEmployee(state) {
      state.currentEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
        state.loading = false;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch employees';
      })
      .addCase(fetchEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.currentEmployee = action.payload;
        state.loading = false;
      })
      .addCase(fetchEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch employee';
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.currentEmployee = action.payload;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(e => e.id !== action.payload);
        if (state.currentEmployee?.id === action.payload) state.currentEmployee = null;
      });
  },
});

export const { clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
