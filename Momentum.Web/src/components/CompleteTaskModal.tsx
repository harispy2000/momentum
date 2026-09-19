import { useState } from 'react';
import type { PlanTask } from '../lib/types';
import { CheckCircle, Clock } from 'lucide-react';

interface CompleteTaskModalProps {
  task: PlanTask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string, actualMinutes?: number, note?: string) => Promise<void>;
}

export default function CompleteTaskModal({
  task,
  isOpen,
  onClose,
  onConfirm,
}: CompleteTaskModalProps) {
  const [actualMinutes, setActualMinutes] = useState<number>(task?.estimatedMinutes ?? 30);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(task.id, actualMinutes, note);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Complete Task</h3>
            <p className="text-xs text-slate-500">Record actual duration to train your personal model</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <p className="text-sm font-semibold text-slate-800">{task.title}</p>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Estimated: {task.estimatedMinutes} mins
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Actual Duration (Minutes)
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="480"
                value={actualMinutes}
                onChange={(e) => setActualMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <div className="flex gap-1">
                {[15, 30, 45, 60].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setActualMinutes(preset)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                      actualMinutes === preset
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Reflection Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Felt focused, finished earlier than expected"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Recording...' : 'Record Completion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
