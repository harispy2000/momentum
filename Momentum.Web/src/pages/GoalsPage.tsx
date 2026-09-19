import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalsStore } from '../store';
import { api } from '../lib/api';
import { PriorityBadge } from '../components/StatusBadge';
import { GoalPriority } from '../lib/types';
import type { Goal } from '../lib/types';
import { formatDate } from '../lib/format';
import {
  Plus,
  Target,
  Sparkles,
  Calendar,
  Trash2,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function GoalsPage() {
  const { goals, loadGoals, createGoal, deleteGoal, loading } = useGoalsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [generatingGoalId, setGeneratingGoalId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<GoalPriority>(GoalPriority.Medium);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const created = await createGoal({
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        priority,
      });

      setTitle('');
      setDescription('');
      setTargetDate('');
      setPriority(GoalPriority.Medium);
      setModalOpen(false);

      // Automatically trigger AI plan generation for instant delight
      await handleGeneratePlan(created);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePlan = async (goal: Goal) => {
    setGeneratingGoalId(goal.id);
    setSuccessMessage(null);
    try {
      await api.createPlan(goal.id);
      setSuccessMessage(`AI Plan successfully generated for "${goal.title}"!`);
      setTimeout(() => {
        navigate('/plan');
      }, 900);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate plan.');
    } finally {
      setGeneratingGoalId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete goal "${title}" and all its tasks?`)) {
      await deleteGoal(id);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Goals & Objectives</h1>
          <p className="mt-1 text-sm text-slate-500">
            Define your high-level milestones. Momentum decomposes them into calibrated daily tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Goal
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Target className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No goals set yet</h2>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Start by creating a goal with a title, priority, and optional deadline.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const isGenerating = generatingGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-bold text-slate-900 leading-snug">{goal.title}</h2>
                    <PriorityBadge priority={goal.priority} />
                  </div>

                  {goal.description && (
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {goal.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Target: {formatDate(goal.targetDate)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleGeneratePlan(goal)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate AI Plan
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(goal.id, goal.title)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Define New Goal</h3>
                <p className="text-xs text-slate-500">Momentum's AI will decompose this into realistic tasks</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Target className="h-5 w-5" />
              </div>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Launch Review 1 MVP for Hackathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Description & Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context on what success looks like, key constraints, or scope."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) as GoalPriority)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/15 bg-white"
                  >
                    <option value={GoalPriority.Low}>Low Priority</option>
                    <option value={GoalPriority.Medium}>Medium Priority</option>
                    <option value={GoalPriority.High}>High Priority</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create & Generate Plan'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
