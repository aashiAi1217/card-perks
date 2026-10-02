import { money, fmtDate } from '../lib/periods.js'

export default function Summary({ items, view, now }) {
  const dollar = items.filter((i) => i.amount != null)
  const total = dollar.reduce((s, i) => s + i.amount, 0)
  const used = dollar.reduce((s, i) => s + Math.min(i.used, i.amount), 0)
  const left = Math.max(0, total - used)
  const doneCount = items.filter((i) => i.done).length
  const pct = items.length ? doneCount / items.length : 0
  const sample = items[0]?.period
  const days = items[0]?.days

  // Period label: for the Year view, calendar-year perks and card-year perks may differ; show the calendar one.
  const label = view.id === 'setup' ? 'One-time setup' : sample?.label ?? ''

  const r = 34, c = 2 * Math.PI * r
  return (
    <section className="summary">
      <div className="ring" aria-hidden>
        <svg viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} className="ring-bg" />
          <circle cx="40" cy="40" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
        </svg>
        <div className="ring-txt">{Math.round(pct * 100)}%</div>
      </div>
      <div className="sum-body">
        <div className="sum-period">{label}{days != null && <span className="sum-days"> · {days === 0 ? 'ends today' : `${days} day${days === 1 ? '' : 's'} left`}</span>}</div>
        {total > 0 ? (
          <>
            <div className="sum-big">{money(left)} <span>left to use</span></div>
            <div className="sum-sub">{money(used)} of {money(total)} captured · {doneCount}/{items.length} perks done</div>
          </>
        ) : (
          <>
            <div className="sum-big">{items.length - doneCount} <span>to do</span></div>
            <div className="sum-sub">{doneCount}/{items.length} done</div>
          </>
        )}
        {sample?.end && <div className="sum-sub faint">Resets after {fmtDate(sample.end)}</div>}
      </div>
    </section>
  )
}
