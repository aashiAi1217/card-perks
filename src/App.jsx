import { useMemo, useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { CARDS } from './data/cards.js'
import { periodFor, perkAmount, isExpired, daysLeft, money } from './lib/periods.js'
import { useStore } from './store.js'
import Summary from './components/Summary.jsx'
import CardGroup from './components/CardGroup.jsx'
import EndingSoon from './components/EndingSoon.jsx'
import CardsPage from './components/CardsPage.jsx'
import GuidePage from './components/GuidePage.jsx'
import Menu from './components/Menu.jsx'

const VIEWS = [
  { id: 'monthly', label: 'Month', cadences: ['monthly'] },
  { id: 'quarterly', label: 'Quarter', cadences: ['quarterly'] },
  { id: 'semiannual', label: 'Half', cadences: ['semiannual'] },
  { id: 'annual', label: 'Year', cadences: ['annual', 'anniversary'] },
  { id: 'setup', label: 'Setup', cadences: ['once', 'ongoing'] },
]

export default function App() {
  const store = useStore()
  const { state } = store
  const params = new URLSearchParams(location.search)
  const [page, setPage] = useState(() => ['checklist', 'cards', 'guide'].includes(params.get('page')) ? params.get('page') : 'checklist')
  const [view, setView] = useState(() => VIEWS.some((v) => v.id === params.get('view')) ? params.get('view') : 'monthly')
  const now = useNow()

  const activeCards = useMemo(() => CARDS.filter((c) => !state.disabledCards.includes(c.id)), [state.disabledCards])

  // Decorate every visible perk with its current period and usage
  const items = useMemo(() => {
    const out = []
    for (const card of activeCards) {
      for (const perk of card.perks) {
        if (state.hidden.includes(perk.id)) continue
        if (perk.gated && !state.hidden.includes(`show:${perk.id}`)) continue // gated perks hidden unless explicitly shown
        if (isExpired(perk, now)) continue
        const period = periodFor(perk.cadence, now, state.anniversary[card.id] ?? 1)
        const amount = perkAmount(perk, now)
        const usage = store.getUsage(perk.id, period.key)
        const used = usage?.used ?? 0
        const done = usage?.done ?? (amount != null && used >= amount)
        out.push({ card, perk, period, amount, used, done, days: daysLeft(period, now) })
      }
    }
    return out
  }, [activeCards, state.hidden, state.anniversary, state.usage, now, store])

  const current = VIEWS.find((v) => v.id === view)
  const viewItems = items.filter((i) => current.cadences.includes(i.perk.cadence))

  // Celebrate when the current view becomes 100% done
  const allDone = viewItems.length > 0 && viewItems.every((i) => i.done)
  const prevDone = useRef(allDone)
  useEffect(() => {
    if (allDone && !prevDone.current) confetti({ particleCount: 140, spread: 80, origin: { y: 0.3 }, colors: ['#f4d58d', '#c9962e', '#ffffff', '#7fb3ff'] })
    prevDone.current = allDone
  }, [allDone])

  return (
    <div className="page">
      <header className="top">
        <div>
          <div className="brand">Perks</div>
          <div className="date">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
        <Menu store={store} />
      </header>

      {page === 'checklist' && (
        <>
          <nav className="seg" role="tablist">
            {VIEWS.map((v) => {
              const its = items.filter((i) => v.cadences.includes(i.perk.cadence))
              const left = its.filter((i) => !i.done).length
              return (
                <button key={v.id} role="tab" aria-selected={view === v.id} className={view === v.id ? 'on' : ''} onClick={() => setView(v.id)}>
                  {v.label}{left > 0 && <span className="dot">{left}</span>}
                </button>
              )
            })}
          </nav>

          <Summary items={viewItems} view={current} now={now} />
          <EndingSoon items={items} now={now} onJump={(cad) => setView(VIEWS.find((v) => v.cadences.includes(cad)).id)} />

          {activeCards.map((card) => {
            const its = viewItems.filter((i) => i.card.id === card.id)
            if (!its.length) return null
            return <CardGroup key={card.id} card={card} items={its} store={store} />
          })}

          {viewItems.length === 0 && <div className="empty">Nothing here. Add cards back or unhide perks in the Cards tab.</div>}
          <p className="foot">Benefits as of Oct 2026. Terms change; the issuer’s site is the source of truth. Tracking lives on this device. Back it up from the ⋯ menu.</p>
        </>
      )}

      {page === 'cards' && <CardsPage store={store} items={items} now={now} />}
      {page === 'guide' && <GuidePage activeCards={activeCards} />}

      <nav className="tabbar">
        {[['checklist', 'Checklist', '☑︎'], ['cards', 'Cards', '▭'], ['guide', 'Which card?', '✦']].map(([id, label, icon]) => (
          <button key={id} className={page === id ? 'on' : ''} onClick={() => setPage(id)}>
            <span className="ico">{icon}</span>{label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    const onVis = () => document.visibilityState === 'visible' && setNow(new Date())
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return now
}
