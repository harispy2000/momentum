export const GoalPriority = {
  Low: 0,
  Medium: 1,
  High: 2,
} as const;
export type GoalPriority = (typeof GoalPriority)[keyof typeof GoalPriority];

export const GoalPriorityNames: Record<GoalPriority, string> = {
  [GoalPriority.Low]: 'Low',
  [GoalPriority.Medium]: 'Medium',
  [GoalPriority.High]: 'High',
};

export const TaskStatus = {
  Pending: 0,
  InProgress: 1,
  Completed: 2,
  Skipped: 3,
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskStatusNames: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'Pending',
  [TaskStatus.InProgress]: 'In progress',
  [TaskStatus.Completed]: 'Completed',
  [TaskStatus.Skipped]: 'Skipped',
};

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  profession?: string;
  timezone?: string;
  preferredTools?: string[];
  skillLevel?: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string | null;
  priority: GoalPriority;
  createdAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  targetDate: string | null;
  priority: GoalPriority;
}

export interface PlanTask {
  id: string;
  planId: string;
  userId: string;
  goalId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  actualMinutes?: number | null;
  scheduledDate: string;
  status: TaskStatus;
  completedAt?: string | null;
  order: number;
  category: string;
  isFlexible: boolean;
}

export interface Plan {
  id: string;
  goalId: string;
  userId: string;
  summary: string;
  version: number;
  createdAt: string;
  tasks: PlanTask[];
}

export interface CompleteTaskRequest {
  actualMinutes?: number;
  note?: string;
}

export interface SkipTaskRequest {
  note?: string;
}

export interface PersonalModel {
  id: string;
  userId: string;
  totalSignals: number;
  completedCount: number;
  skippedCount: number;
  delayedCount: number;
  completionRate: number;
  averageSessionMinutes: number | null;
  averageEstimateAccuracy: number | null;
  overloadTendency: number;
  preferredProductivePeriods: string[];
  periodCounts: Record<string, number>;
  explainabilityStatements: string[];
  updatedAt: string;
}

export const PlanChangeType = {
  NoChange: 0,
  ReducedLoad: 1,
  IncreasedChallenge: 2,
  TaskBrokenDown: 3,
  Rescheduled: 4,
} as const;
export type PlanChangeType = (typeof PlanChangeType)[keyof typeof PlanChangeType];

export const PlanChangeTypeNames: Record<PlanChangeType, string> = {
  [PlanChangeType.NoChange]: 'No Change',
  [PlanChangeType.ReducedLoad]: 'Reduced Load',
  [PlanChangeType.IncreasedChallenge]: 'Increased Challenge',
  [PlanChangeType.TaskBrokenDown]: 'Task Broken Down',
  [PlanChangeType.Rescheduled]: 'Rescheduled',
};

export interface AdaptationChange {
  planId: string;
  type: PlanChangeType;
  summary: string;
  explanation: string;
  affectedTaskIds: string[];
}

export interface BehaviorSignal {
  id: string;
  userId: string;
  taskId: string;
  planId: string;
  type: number;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  durationDeltaMinutes?: number | null;
  completionHour: number;
  note?: string | null;
  timestamp: string;
}