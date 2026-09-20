import { create } from 'zustand';
import { api, getToken, setToken } from './lib/api';
import type { AdaptationChange, CreateGoalRequest, Goal, PersonalModel, PlanTask, User } from './lib/types';

// ==========================================
// AUTH STORE
// ==========================================
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  initAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getToken(),
  loading: false,
  initialized: false,
  initAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ user: null, token: null, initialized: true });
      return;
    }
    set({ loading: true });
    try {
      const user = await api.getMe();
      set({ user, token, initialized: true });
    } catch {
      setToken(null);
      set({ user: null, token: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },
  login: async (email: string, pass: string) => {
    set({ loading: true });
    try {
      const res = await api.login({ email, password: pass });
      setToken(res.token);
      set({ user: res.user, token: res.token });
    } finally {
      set({ loading: false });
    }
  },
  register: async (email: string, pass: string, fullName?: string) => {
    set({ loading: true });
    try {
      const res = await api.register({ email, password: pass, fullName });
      setToken(res.token);
      set({ user: res.user, token: res.token });
    } finally {
      set({ loading: false });
    }
  },
  logout: () => {
    setToken(null);
    set({ user: null, token: null });
  },
}));

// ==========================================
// GOALS STORE
// ==========================================
interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  loadGoals: () => Promise<void>;
  createGoal: (input: CreateGoalRequest) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: false,
  error: null,
  loaded: false,
  loadGoals: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await api.getGoals();
      set({ goals, loaded: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load goals.' });
    } finally {
      set({ loading: false });
    }
  },
  createGoal: async (input: CreateGoalRequest) => {
    const created = await api.createGoal(input);
    set({ goals: [created, ...get().goals] });
    return created;
  },
  deleteGoal: async (id: string) => {
    await api.deleteGoal(id);
    set({ goals: get().goals.filter((g) => g.id !== id) });
  },
}));

// ==========================================
// TASKS STORE
// ==========================================
interface TasksState {
  todayTasks: PlanTask[];
  allTasks: PlanTask[];
  loading: boolean;
  error: string | null;
  loadTodayTasks: () => Promise<void>;
  loadAllTasks: () => Promise<void>;
  completeTask: (id: string, actualMinutes?: number, note?: string) => Promise<void>;
  skipTask: (id: string, note?: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  todayTasks: [],
  allTasks: [],
  loading: false,
  error: null,
  loadTodayTasks: async () => {
    set({ loading: true, error: null });
    try {
      const todayTasks = await api.getTodayTasks();
      set({ todayTasks });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load tasks.' });
    } finally {
      set({ loading: false });
    }
  },
  loadAllTasks: async () => {
    set({ loading: true, error: null });
    try {
      const allTasks = await api.getAllTasks();
      set({ allTasks });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load all tasks.' });
    } finally {
      set({ loading: false });
    }
  },
  completeTask: async (id: string, actualMinutes?: number, note?: string) => {
    const result = await api.completeTask(id, { actualMinutes, note });
    set({
      todayTasks: get().todayTasks.map((t) => (t.id === id ? result.task : t)),
      allTasks: get().allTasks.map((t) => (t.id === id ? result.task : t)),
    });
    useModelStore.getState().updateModel(result.personalModel);
  },
  skipTask: async (id: string, note?: string) => {
    const result = await api.skipTask(id, { note });
    set({
      todayTasks: get().todayTasks.map((t) => (t.id === id ? result.task : t)),
      allTasks: get().allTasks.map((t) => (t.id === id ? result.task : t)),
    });
    useModelStore.getState().updateModel(result.personalModel);
  },
}));

// ==========================================
// PERSONAL MODEL STORE
// ==========================================
interface ModelState {
  model: PersonalModel | null;
  insights: string[];
  loading: boolean;
  loadModel: () => Promise<void>;
  updateModel: (updated: PersonalModel) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  model: null,
  insights: [],
  loading: false,
  loadModel: async () => {
    set({ loading: true });
    try {
      const [model, insightsRes] = await Promise.all([
        api.getPersonalModel(),
        api.getInsights(),
      ]);
      set({ model, insights: insightsRes.insights });
    } catch {
      // Ignore initial errors if not yet ready
    } finally {
      set({ loading: false });
    }
  },
  updateModel: (updated: PersonalModel) => {
    set({
      model: updated,
      insights: updated.explainabilityStatements ?? [],
    });
  },
}));

// ==========================================
// ADAPTATION STORE
// ==========================================
interface AdaptationState {
  changes: AdaptationChange[];
  loading: boolean;
  error: string | null;
  previewAdaptation: (planId: string) => Promise<AdaptationChange[]>;
  applyAdaptation: (planId: string) => Promise<AdaptationChange[]>;
  clearChanges: () => void;
}

export const useAdaptationStore = create<AdaptationState>((set) => ({
  changes: [],
  loading: false,
  error: null,
  previewAdaptation: async (planId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await api.getPlanAdaptation(planId);
      set({ changes: result.changes });
      return result.changes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to preview adaptation.';
      set({ error: message });
      return [];
    } finally {
      set({ loading: false });
    }
  },
  applyAdaptation: async (planId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await api.applyPlanAdaptation(planId);
      set({ changes: result.changes });
      return result.changes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply adaptation.';
      set({ error: message });
      return [];
    } finally {
      set({ loading: false });
    }
  },
  clearChanges: () => set({ changes: [], error: null }),
}));

// ==========================================
// PROFILE STORE
// ==========================================
interface ProfileState {
  saving: boolean;
  error: string | null;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  saving: false,
  error: null,
  updateProfile: async (data: Partial<User>) => {
    set({ saving: true, error: null });
    try {
      const updated = await api.updateProfile(data);
      useAuthStore.setState({ user: updated });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save profile.' });
      throw err;
    } finally {
      set({ saving: false });
    }
  },
}));