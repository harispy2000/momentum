import type { GoalPriority, TaskStatus } from '../lib/types';
import { GoalPriority as GP, GoalPriorityNames, TaskStatus as TS, TaskStatusNames } from '../lib/types';

const priorityStyles: Record<GoalPriority, string> = {
  [GP.Low]: 'bg-slate-100 text-slate-600',
  [GP.Medium]: 'bg-indigo-50 text-indigo-700',
  [GP.High]: 'bg-amber-100 text-amber-800',
};

const statusStyles: Record<TaskStatus, string> = {
  [TS.Pending]: 'bg-slate-100 text-slate-600',
  [TS.InProgress]: 'bg-blue-50 text-blue-700',
  [TS.Completed]: 'bg-emerald-100 text-emerald-700',
  [TS.Skipped]: 'bg-slate-100 text-slate-400 line-through',
};

const badge = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

export function PriorityBadge({ priority }: { priority: GoalPriority }) {
  return <span className={`${badge} ${priorityStyles[priority] ?? priorityStyles[GP.Medium]}`}>{GoalPriorityNames[priority] ?? 'Medium'}</span>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`${badge} ${statusStyles[status] ?? statusStyles[TS.Pending]}`}>{TaskStatusNames[status] ?? 'Pending'}</span>;
}