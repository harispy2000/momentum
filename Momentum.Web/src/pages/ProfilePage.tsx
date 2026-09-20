import { useState, useEffect } from 'react';
import { useAuthStore, useProfileStore } from '../store';
import {
  User,
  Briefcase,
  Globe,
  Wrench,
  BarChart2,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+03:30', 'UTC+04:00', 'UTC+04:30', 'UTC+05:00',
  'UTC+05:30 (IST)', 'UTC+05:45', 'UTC+06:00', 'UTC+06:30', 'UTC+07:00',
  'UTC+08:00', 'UTC+09:00', 'UTC+09:30', 'UTC+10:00', 'UTC+11:00',
  'UTC+12:00',
];
const TOOL_OPTIONS = [
  'VS Code', 'IntelliJ IDEA', 'PyCharm', 'Xcode', 'Android Studio',
  'Figma', 'Sketch', 'Adobe XD', 'Notion', 'Jira', 'Linear',
  'GitHub', 'GitLab', 'Bitbucket', 'Slack', 'Discord', 'Zoom',
  'Postman', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Firebase', 'Supabase', 'MongoDB', 'PostgreSQL', 'MySQL',
];

interface FormData {
  fullName: string;
  profession: string;
  bio: string;
  timezone: string;
  skillLevel: string;
  preferredTools: string[];
}

function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
      <Icon className="h-4 w-4 text-indigo-500" />
      {label}
    </label>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { saving, error, updateProfile } = useProfileStore();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<FormData>({
    fullName: user?.fullName ?? '',
    profession: user?.profession ?? '',
    bio: user?.bio ?? '',
    timezone: user?.timezone ?? 'UTC+05:30 (IST)',
    skillLevel: user?.skillLevel ?? 'Intermediate',
    preferredTools: user?.preferredTools ?? [],
  });

  // Sync if user changes
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? '',
        profession: user.profession ?? '',
        bio: user.bio ?? '',
        timezone: user.timezone ?? 'UTC+05:30 (IST)',
        skillLevel: user.skillLevel ?? 'Intermediate',
        preferredTools: user.preferredTools ?? [],
      });
    }
  }, [user]);

  const toggleTool = (tool: string) => {
    setForm((f) => ({
      ...f,
      preferredTools: f.preferredTools.includes(tool)
        ? f.preferredTools.filter((t) => t !== tool)
        : [...f.preferredTools, tool],
    }));
  };

  const handleSave = async () => {
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error is in store
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Your Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            The more you tell us, the smarter your AI plan becomes.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Feedback banners */}
      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Profile saved successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-700 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Avatar + Basic */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-black text-white shadow-lg shadow-indigo-500/30 shrink-0">
            {(form.fullName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{form.fullName || 'Your Name'}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <FieldLabel icon={User} label="Full Name" />
            <input
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="e.g. Harish Venkataraman"
            />
          </div>

          {/* Profession */}
          <div>
            <FieldLabel icon={Briefcase} label="Profession / Job Title" />
            <input
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={form.profession}
              onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
              placeholder="e.g. Full-Stack Engineer, Designer, PM…"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5">
          <FieldLabel icon={FileText} label="Bio / About You" />
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell the AI a bit about yourself — your interests, working style, what motivates you…"
          />
        </div>
      </div>

      {/* Timezone + Skill Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <FieldLabel icon={Globe} label="Timezone" />
          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 pr-8 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-xs text-slate-400">Used to schedule tasks at the right time of day.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <FieldLabel icon={BarChart2} label="Skill Level" />
          <div className="grid grid-cols-2 gap-2">
            {SKILL_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setForm((f) => ({ ...f, skillLevel: level }))}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  form.skillLevel === level
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">Helps calibrate task complexity and time estimates.</p>
        </div>
      </div>

      {/* Preferred Tools */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <FieldLabel icon={Wrench} label="Preferred Tools & Platforms" />
        <p className="mb-4 text-xs text-slate-400">Select the tools you use regularly so the AI can tailor task recommendations.</p>
        <div className="flex flex-wrap gap-2">
          {TOOL_OPTIONS.map((tool) => {
            const selected = form.preferredTools.includes(tool);
            return (
              <button
                key={tool}
                onClick={() => toggleTool(tool)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selected
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {tool}
              </button>
            );
          })}
        </div>
        {form.preferredTools.length > 0 && (
          <p className="mt-3 text-xs text-indigo-500 font-medium">
            ✓ {form.preferredTools.length} tool{form.preferredTools.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* AI Impact summary */}
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 p-6">
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
          How this improves your AI plan
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Smarter scheduling</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Timezone-aware task timing</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Calibrated estimates</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Skill level adjusts task duration</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Context-aware tasks</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Tools & profession shape suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
