import { useState } from 'react'
import PerkRow from './PerkRow.jsx'
import { money } from '../lib/periods.js'

export default function CardGroup({ card, items, store }) {
  const [open, setOpen] = useState(true)
  const dollar = items.filter((i) => i.amount != null)
  const total = dollar.reduce((s, i) => s + i.amount, 0)
  const used = dollar.reduce((s, i) => s + Math.min(i.used, i.amount), 0)
  const done = items.filter((i) => i.done).length
  const sorted = [...items].sort((a, b) => a.done - b.done || (b.amount ?? 0) - (a.amount ?? 0))

  return (
    <section className={`group theme-${card.theme}`}>
      <button className="group-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="swatch" />
        <span className="group-name">{card.name}</span>
        <span className="group-meta">
          {total > 0 ? <>{money(used)}<span className="of">/{money(total)}</span></> : `${done}/${items.length}`}
        </span>
        <span className={`chev ${open ? 'up' : ''}`}>›</span>
      </button>
      {total > 0 && <div className="bar"><div style={{ width: `${Math.min(100, (used / total) * 100)}%` }} /></div>}
      {open && <div className="rows">{sorted.map((i) => <PerkRow key={i.perk.id} item={i} store={store} />)}</div>}
    </section>
  )
}
