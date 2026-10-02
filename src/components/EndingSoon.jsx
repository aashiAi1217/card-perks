import { money } from '../lib/periods.js'

// Unused perks across every cadence that reset within 10 days.
export default function EndingSoon({ items, now, onJump }) {
  const soon = items
    .filter((i) => !i.done && i.days != null && i.days <= 10)
    .sort((a, b) => a.days - b.days || (b.amount ?? 0) - (a.amount ?? 0))
  if (!soon.length) return null
  const value = soon.reduce((s, i) => s + (i.amount != null ? i.amount - Math.min(i.used, i.amount) : 0), 0)
  return (
    <section className="soon">
      <div className="soon-head">
        <span className="pulse" /> Ending soon{value > 0 && <span className="soon-val">{money(value)} at stake</span>}
      </div>
      <div className="soon-row">
        {soon.map((i) => (
          <button key={i.perk.id} className={`chip chip-${i.card.theme}`} onClick={() => onJump(i.perk.cadence)}>
            <span className="chip-card">{i.card.short}</span>
            <span className="chip-name">{i.perk.name}</span>
            <span className="chip-meta">{i.amount != null ? money(i.amount - Math.min(i.used, i.amount)) + ' · ' : ''}{i.days === 0 ? 'today' : `${i.days}d`}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
