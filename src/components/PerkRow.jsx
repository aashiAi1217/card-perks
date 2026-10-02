import { useState } from 'react'
import { CATEGORY_ICON, CADENCE_LABEL } from '../data/cards.js'
import { money, fmtDate } from '../lib/periods.js'

export default function PerkRow({ item, store }) {
  const { perk, period, amount, used, done, days } = item
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const toggle = (e) => {
    e.stopPropagation()
    if (done) store.clearUsage(perk.id, period.key)
    else store.setUsage(perk.id, period.key, { done: true, used: amount ?? 0 })
  }
  const addAmount = (v) => {
    const n = Math.max(0, Math.min(amount, used + v))
    store.setUsage(perk.id, period.key, { used: n, done: n >= amount })
  }
  const setExact = () => {
    const n = parseFloat(draft)
    if (Number.isNaN(n)) return
    const v = Math.max(0, Math.min(amount, n))
    store.setUsage(perk.id, period.key, { used: v, done: v >= amount })
    setDraft('')
  }

  const urgent = !done && days != null && days <= 7
  const partial = !done && used > 0

  return (
    <div className={`row ${done ? 'done' : ''} ${open ? 'open' : ''}`}>
      <div className="row-main" onClick={() => setOpen((o) => !o)}>
        <button className={`check ${done ? 'on' : partial ? 'half' : ''}`} onClick={toggle} aria-label={done ? 'Mark unused' : 'Mark used'}>
          {done ? '✓' : partial ? '·' : ''}
        </button>
        <div className="row-text">
          <div className="row-name">
            <span className="cat" aria-hidden>{CATEGORY_ICON[perk.category]}</span>
            {perk.name}
          </div>
          <div className="row-sub">
            {partial && <span className="tag tag-partial">{money(used)} used</span>}
            {perk.enroll && <span className="tag">Enroll</span>}
            {urgent && <span className="tag tag-urgent">{days === 0 ? 'Last day' : `${days}d left`}</span>}
            {perk.expires && <span className="tag tag-exp">Ends {perk.expires.slice(0, 7).replace('-', '/')}</span>}
            <span className="merch">{perk.merchants}</span>
          </div>
        </div>
        <div className="row-amt">
          {amount != null ? <span className="amt">{money(amount)}</span> : <span className="amt faint">{CADENCE_LABEL[perk.cadence]}</span>}
        </div>
      </div>

      {open && (
        <div className="row-detail">
          <p className="tip">{perk.tip}</p>
          <div className="detail-meta">
            <span>{CADENCE_LABEL[perk.cadence]}</span>
            {period.end && <span>· {period.label} · resets after {fmtDate(period.end)}</span>}
            {perk.gated && <span>· {perk.gated}</span>}
          </div>
          {amount != null && amount >= 20 && (
            <div className="partial">
              <span className="partial-lbl">Used so far: <b>{money(used)}</b> of {money(amount)}</span>
              <div className="partial-ctl">
                {[10, 25, 50].filter((v) => v < amount).map((v) => (
                  <button key={v} onClick={() => addAmount(v)}>+{money(v)}</button>
                ))}
                <input inputMode="decimal" placeholder="exact $" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setExact()} />
                <button onClick={setExact} disabled={!draft}>Set</button>
              </div>
            </div>
          )}
          <div className="detail-actions">
            <button className="ghost" onClick={toggle}>{done ? 'Mark unused' : 'Mark fully used'}</button>
            <button className="ghost danger" onClick={() => store.toggleHidden(perk.id)}>Hide, not for me</button>
          </div>
        </div>
      )}
    </div>
  )
}
