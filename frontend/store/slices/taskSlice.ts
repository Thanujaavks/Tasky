import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { Task, TaskStats, EmployeeStats } from '@/types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  stats: TaskStats | null;
  employeeStats: EmployeeStats[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  stats: null,
  employeeStats: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params?: Record<string, string>) => {
    const res = await api.getTasks(params);
    return res.tasks as Task[];
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (id: number) => {
    const res = await api.getTask(id);
    return res.task as Task;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: object) => {
    await api.createTask(data);
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: number; data: object }) => {
    await api.updateTask(id, data);
    const res = await api.getTask(id);
    return res.task as Task;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number) => {
    await api.deleteTask(id);
    return id;
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ id, status }: { id: number; status: string }) => {
    await api.updateTaskStatus(id, status);
    const res = await api.getTask(id);
    return res.task as Task;
  }
);

export const fetchStats = createAsyncThunk('tasks/fetchStats', async () => {
  const res = await api.getStats();
  return {
    stats: res.stats as TaskStats,
    employeeStats: (res.employeeStats || []) as EmployeeStats[],
  };
});

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ id, comment }: { id: number; comment: string }) => {
    await api.addComment(id, comment);
    const res = await api.getTask(id);
    return res.task as Task;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask(state) {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch tasks';
      })
      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.currentTask = action.payload;
        state.loading = false;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch task';
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.currentTask = action.payload;
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) state.currentTask = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.currentTask = action.payload;
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        state.employeeStats = action.payload.employeeStats;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.currentTask = action.payload;
      });
  },
});

export const { clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
