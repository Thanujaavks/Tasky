export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department?: string;
  phone?: string;
  avatar_url?: string;
  is_active?: number;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  assigned_to_email?: string;
  assigned_to_department?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  comment: string;
  created_at: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  high_priority: number;
  overdue: number;
}

export interface EmployeeStats extends User {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
