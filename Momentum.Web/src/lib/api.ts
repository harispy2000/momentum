import type {
  AdaptationChange,
  AuthResponse,
  CompleteTaskRequest,
  CreateGoalRequest,
  Goal,
  PersonalModel,
  Plan,
  PlanTask,
  SkipTaskRequest,
  User,
} from './types';

const BASE = '/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem('momentum_token');
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('momentum_token', token);
    } else {
      localStorage.removeItem('momentum_token');
    }
  } catch {
    // ignore
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...headers,
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'Could not reach the Momentum API. Is the API project running?');
  }

  if (response.status === 401) {
    // If token invalid, clear it
    if (token && path !== '/auth/login' && path !== '/auth/register') {
      setToken(null);
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string; title?: string; detail?: string };
      message = body.message ?? body.title ?? body.detail ?? message;
    } catch {
      // keep the default message
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; fullName?: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<User>('/auth/me'),

  // Goals
  getGoals: () => request<Goal[]>('/goals'),
  getGoal: (id: string) => request<Goal>(`/goals/${id}`),
  createGoal: (input: CreateGoalRequest) =>
    request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  deleteGoal: (id: string) =>
    request<void>(`/goals/${id}`, {
      method: 'DELETE',
    }),

  // AI Plans
  createPlan: (goalId: string) =>
    request<Plan>(`/goals/${goalId}/plan`, {
      method: 'POST',
    }),
  getActivePlans: () => request<Plan[]>('/plans/active'),
  getPlan: (planId: string) => request<Plan>(`/plans/${planId}`),

  // Tasks
  getTodayTasks: () => request<PlanTask[]>('/tasks/today'),
  getAllTasks: () => request<PlanTask[]>('/tasks'),
  completeTask: (taskId: string, input: CompleteTaskRequest) =>
    request<{ task: PlanTask; personalModel: PersonalModel; message: string }>(
      `/tasks/${taskId}/complete`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    ),
  skipTask: (taskId: string, input: SkipTaskRequest) =>
    request<{ task: PlanTask; personalModel: PersonalModel; message: string }>(
      `/tasks/${taskId}/skip`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    ),

  // Personal Model & Explainability
  getPersonalModel: () => request<PersonalModel>('/model'),
  getInsights: () => request<{ insights: string[] }>('/model/insights'),

  // Plan Adaptation
  getPlanAdaptation: (planId: string) =>
    request<{ planId: string; changes: AdaptationChange[] }>(`/plans/${planId}/adapt`),
  applyPlanAdaptation: (planId: string) =>
    request<{ planId: string; version: number; changes: AdaptationChange[] }>(`/plans/${planId}/adapt`, {
      method: 'POST',
    }),

  // User Profile
  getProfile: () => request<User>('/auth/me'),
  updateProfile: (data: Partial<User>) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};