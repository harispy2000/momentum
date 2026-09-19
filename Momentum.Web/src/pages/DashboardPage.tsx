import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useGoalsStore, useModelStore, useTasksStore } from '../store';
import { PriorityBadge } from '../components/StatusBadge';
import CompleteTaskModal from '../components/CompleteTaskModal';
import type { PlanTask } from '../lib/types';
import { TaskStatus } from '../lib/types';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  Plus,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  SkipForward,
  ListTodo
} from 'lucide-react';
import { formatDate } from '../lib/format';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { goals, loadGoals } = useGoalsStore();
  const { todayTasks, loadTodayTasks, completeTask, skipTask } = useTasksStore();
  const { model, insights, loadModel } = useModelStore();

  const [selectedTask, setSelectedTask] = useState<PlanTask | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadGoals();
    loadTodayTasks();
    loadModel();
  }, [loadGoals, loadTodayTasks, loadModel]);

  const handleOpenComplete = (task: PlanTask) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleSkip = async (taskId: string) => {
    if (confirm('Are you sure you want to skip this task? This will be recorded in your behavioral model.')) {
      await skipTask(taskId);
    }
  };

  const pendingTasks = todayTasks.filter((t) => t.status !== TaskStatus.Completed && t.status !== TaskStatus.Skipped);
  const completedToday = todayTasks.filter((t) => t.status === TaskStatus.Completed);
  const completionRatePercent = (todayTasks.length > 0)
    ? Math.round((completedToday.length / todayTasks.length) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {user?.fullName || 'Builder'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is your adaptive roadmap and execution momentum for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/goals"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Goal
          </Link>
        </div>
      </div>

      {/* AI Explainability & Personal Model Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-xs border border-indigo-400/20">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              <span>Momentum Intelligence</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Momentum is learning your work patterns.
            </h2>
            <p className="max-w-2xl text-xs text-indigo-100/80 leading-relaxed">
              {insights.length > 0
                ? insights[0]
                : 'As you complete and record actual task durations, Momentum personalizes your execution pace and plan difficulty.'}
            </p>
          </div>

          <Link
            to="/model"
            className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xs border border-white/10 transition-colors"
          >
            <BrainCircuit className="h-4 w-4" />
            View Personal Model
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Today</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingTasks.length}</span>
            <span className="text-xs text-slate-400">task{pendingTasks.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Today</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{completedToday.length}</span>
            <span className="text-xs text-slate-400">finished</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Progress</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{completionRatePercent}%</span>
            <span className="text-xs text-slate-400">done</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Goals</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{goals.length}</span>
            <span className="text-xs text-slate-400">goal{goals.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Today's Tasks Column (2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <ListTodo className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Today's Tasks</h2>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {todayTasks.length} task{todayTasks.length === 1 ? '' : 's'} scheduled
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">No tasks scheduled for today</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Create a goal and let Momentum's AI generate a calibrated execution plan with realistic tasks.
              </p>
              <Link
                to="/goals"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create First Goal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => {
                const isCompleted = task.status === TaskStatus.Completed;
                const isSkipped = task.status === TaskStatus.Skipped;

                return (
                  <div
                    key={task.id}
                    className={`group flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                      isCompleted
                        ? 'border-emerald-100 bg-emerald-50/40 opacity-80'
                        : isSkipped
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : 'border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Action checkbox */}
                    <button
                      type="button"
                      disabled={isCompleted || isSkipped}
                      onClick={() => handleOpenComplete(task)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        isCompleted
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : isSkipped
                          ? 'border-slate-300 bg-slate-200 text-slate-500'
                          : 'border-slate-300 hover:border-indigo-600 hover:bg-indigo-50 text-transparent'
                      }`}
                      title={isCompleted ? 'Completed' : 'Click to complete'}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Task Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            isCompleted
                              ? 'text-slate-500 line-through'
                              : isSkipped
                              ? 'text-slate-400 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 uppercase tracking-wide">
                          {task.category}
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.description}</p>
                      )}

                      <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Est: {task.estimatedMinutes}m
                        </span>
                        {task.actualMinutes && (
                          <span className="flex items-center gap-1 font-medium text-emerald-600">
                            Actual: {task.actualMinutes}m
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {!isCompleted && !isSkipped && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenComplete(task)}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSkip(task.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          title="Skip task"
                        >
                          <SkipForward className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Goals Column (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <Target className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Active Goals</h2>
            </div>
            <Link to="/goals" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center">
              <p className="text-xs text-slate-500">No active goals yet.</p>
              <Link
                to="/goals"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Create your first goal →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 4).map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-hover hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{goal.title}</h3>
                    <PriorityBadge priority={goal.priority} />
                  </div>

                  {goal.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{goal.description}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                    <span>Deadline: {formatDate(goal.targetDate)}</span>
                    <Link
                      to="/plan"
                      className="font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Plan →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Personal Model Mini Widget */}
          {model && model.totalSignals > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  Learned Profile
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <p>• Completion Rate: <strong className="text-slate-900">{Math.round(model.completionRate * 100)}%</strong></p>
                {model.averageSessionMinutes && (
                  <p>• Avg Session: <strong className="text-slate-900">{model.averageSessionMinutes}m</strong></p>
                )}
                {model.preferredProductivePeriods.length > 0 && (
                  <p>• Peak Time: <strong className="text-slate-900">{model.preferredProductivePeriods[0]}</strong></p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Task Modal */}
      <CompleteTaskModal
        isOpen={modalOpen}
        task={selectedTask}
        onClose={() => setModalOpen(false)}
        onConfirm={async (taskId, actualMinutes, note) => {
          await completeTask(taskId, actualMinutes, note);
          await loadTodayTasks();
          await loadModel();
        }}
      />
    </div>
  );
}
