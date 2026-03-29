type Props = {
  creditsRemaining: number | null
  isUnlimited: boolean
  /** Total credits (remaining + used) for summary display */
  creditsUsed?: number
  /** Compact mode (practice header) vs summary mode (landing toolbar) */
  variant?: 'compact' | 'summary'
}

/**
 * Credit badge shown in the toolbar and practice header.
 *
 * - variant="compact": "🔮 12 credits" or "∞ Unlimited" (practice header)
 * - variant="summary": "🔮 X / 20 used" or "✦ Unlimited" (landing toolbar)
 */
export default function CreditIndicator({ creditsRemaining, isUnlimited, creditsUsed, variant = 'compact' }: Props) {
  // ── Unlimited user (super_user / paid_user) ──────────────────────────────
  if (isUnlimited) {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-300"
        title="Unlimited AI feedback — no credit limit"
      >
        <span>✦</span>
        <span>Unlimited</span>
      </div>
    )
  }

  // Not authenticated yet — nothing to show
  if (creditsRemaining === null || creditsRemaining === undefined) {
    return null
  }

  const isLow = creditsRemaining <= 5
  const isEmpty = creditsRemaining <= 0
  const totalCredits = creditsUsed != null ? creditsRemaining + creditsUsed : null

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm
        ${isEmpty
          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
          : isLow
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
        }
      `}
      title={`${creditsRemaining} AI feedback credit${creditsRemaining === 1 ? '' : 's'} remaining`}
    >
      <span>{isEmpty ? '⚠️' : '🔮'}</span>
      <span>
        {isEmpty
          ? 'No credits'
          : variant === 'summary' && totalCredits != null
            ? `${creditsUsed} / ${totalCredits} used`
            : `${creditsRemaining} credit${creditsRemaining === 1 ? '' : 's'}`
        }
      </span>
    </div>
  )
}
