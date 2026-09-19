import { useEffect } from 'react';
import { useModelStore } from '../store';
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Info,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  ShieldCheck
} from 'lucide-react';

export default function PersonalModelPage() {
  const { model, insights, loadModel } = useModelStore();

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  const hasData = model && model.totalSignals > 0;

  const periodIcons: Record<string, typeof Sunrise> = {
    'Morning (6 AM - 12 PM)': Sunrise,
    'Afternoon (12 PM - 6 PM)': Sun,
    'Evening (6 PM - 12 AM)': Sunset,
    'Night (12 AM - 6 AM)': Moon,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600">
          <BrainCircuit className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Behavioral Intelligence</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Personal Work Model
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          Momentum learns your authentic work habits from recorded execution signals. No fabricated insights.
        </p>
      </div>

      {/* Main Explainability Banner */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-3 py-0.5 text-xs font-semibold text-indigo-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Grounded Explainability
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Momentum is learning your work patterns.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {hasData
                ? `Based on ${model.totalSignals} recorded behavioral interaction(s), your personal model adapts task estimates, pacing, and difficulty to fit your authentic rhythm.`
                : 'Momentum does not simulate or guess your productivity. Complete or skip your first scheduled task to begin generating tailored insights.'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Completion Rate */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {hasData ? `${Math.round(model.completionRate * 100)}%` : '—'}
            </span>
            {hasData && (
              <span className="text-xs text-slate-400">
                ({model.completedCount} of {model.completedCount + model.skippedCount})
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {hasData
              ? `${model.completedCount} completed, ${model.skippedCount} skipped`
              : 'Awaiting task signals'}
          </p>
        </div>

        {/* Avg Session Duration */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Session</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {model?.averageSessionMinutes ? `${model.averageSessionMinutes}m` : '—'}
            </span>
            {model?.averageSessionMinutes && (
              <span className="text-xs text-slate-400">actual</span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {model?.averageSessionMinutes
              ? 'Derived from recorded completion timestamps'
              : 'Requires at least 1 completed task'}
          </p>
        </div>

        {/* Estimation Accuracy */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimate Ratio</span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {model?.averageEstimateAccuracy ? `${model.averageEstimateAccuracy}x` : '—'}
            </span>
            {model?.averageEstimateAccuracy && (
              <span className="text-xs text-slate-400">actual / est</span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {model?.averageEstimateAccuracy
              ? model.averageEstimateAccuracy < 1
                ? 'You complete tasks faster than estimated'
                : 'Tasks take slightly longer than estimated'
              : 'Calculated from actual vs estimated times'}
          </p>
        </div>

        {/* Overload Tendency */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Overload Signal</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {hasData ? `${Math.round(model.overloadTendency * 100)}%` : '—'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {hasData
              ? model.overloadTendency > 0.4
                ? 'High drift detected; trimming suggested'
                : 'Pacing is currently balanced'
              : 'Tracks postponed/skipped drift'}
          </p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Preferred Productive Windows */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Productive Time Windows</h2>
              <p className="text-xs text-slate-500">
                Calculated from timestamps when you actually completed tasks
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Sun className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {['Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 6 PM)', 'Evening (6 PM - 12 AM)', 'Night (12 AM - 6 AM)'].map(
              (period) => {
                const count = model?.periodCounts?.[period] ?? 0;
                const totalCompleted = model?.completedCount || 1;
                const pct = hasData && model?.completedCount ? Math.round((count / totalCompleted) * 100) : 0;
                const Icon = periodIcons[period] || Sun;

                return (
                  <div key={period} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                        {period}
                      </span>
                      <span className="text-slate-500">
                        {count} task{count === 1 ? '' : 's'} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Explainability Audit Log */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Explainable Model Insights</h2>
              <p className="text-xs text-slate-500">
                Strictly derived from your recorded behavior
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Info className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {insights.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                No insights generated yet. Complete tasks on your dashboard to train the model.
              </div>
            ) : (
              insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-600">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Transparency Guarantee:</strong> Momentum never uses random numbers or predefined personas. Every metric shown is calculated directly from your database records.
          </div>
        </div>
      </div>
    </div>
  );
}
