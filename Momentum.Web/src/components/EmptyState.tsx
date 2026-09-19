import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  children?: ReactNode
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
        ◆
      </div>
      <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-slate-500">{description}</p>
      ) : null}
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          {actionLabel}
        </Link>
      ) : null}
      {children}
    </div>
  )
}