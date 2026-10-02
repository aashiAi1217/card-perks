import { CARDS } from '../data/cards.js'
import { annualValue, periodKeysInYear, money } from '../lib/periods.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CardsPage({ store, now }) {
  const { state } = store
  const year = now.getFullYear()

  return (
    <div className="cards-page">
      <p className="lede">Fee math for {year}, plus what each card earns. Hide perks you’ll never use so the checklist stays honest.</p>
      {CARDS.map((card) => {
        const off = state.disabledCards.includes(card.id)
        const anniv = state.anniversary[card.id] ?? 1
        // $ captured this calendar year across every period of every dollar perk
        let captured = 0
        for (const perk of card.perks) {
          if (perk.amount == null) continue
          for (const k of periodKeysInYear(perk.cadence, year, anniv)) {
            const u = state.usage[perk.id]?.[k]
            if (u) captured += Math.min(u.used ?? 0, perk.amount)
          }
        }
        const possible = card.perks.filter((p) => !state.hidden.includes(p.id) && !p.gated).reduce((s, p) => s + annualValue(p), 0)
        const hidden = card.perks.filter((p) => state.hidden.includes(p.id))
        const gated = card.perks.filter((p) => p.gated)
        const hasAnniv = card.perks.some((p) => p.cadence === 'anniversary')
        const recovered = card.fee ? Math.min(1, captured / card.fee) : 1

        return (
          <section key={card.id} className={`cardbox theme-${card.theme} ${off ? 'off' : ''}`}>
            <div className="art">
              <div className="art-top"><span>{card.issuer}</span><span>{card.network}</span></div>
              <div className="art-name">{card.name}</div>
              <div className="art-bot">
                <span>{card.fee ? `${money(card.fee)} / yr` : 'No annual fee'}</span>
                <label className="switch"><input type="checkbox" checked={!off} onChange={() => store.toggleCard(card.id)} /><span>I have this</span></label>
              </div>
            </div>

            {!off && (
              <div className="cardbox-body">
                <div className="fee">
                  <div className="fee-line">
                    <span>Credits captured in {year}</span><b>{money(captured)}</b>
                  </div>
                  <div className="bar big"><div style={{ width: `${recovered * 100}%` }} /></div>
                  <div className="fee-sub">
                    {card.fee
                      ? captured >= card.fee
                        ? `Fee covered. You’re ${money(captured - card.fee)} ahead.`
                        : `${money(card.fee - captured)} more to break even on the fee. Up to ${money(possible)} in credits available a year.`
                      : `Up to ${money(possible)} in credits available a year, no fee to recover.`}
                  </div>
                </div>

                <div className="earn">
                  {card.earn.map(([x, what]) => <div key={what} className="earn-row"><b>{x}</b><span>{what}</span></div>)}
                </div>

                {hasAnniv && (
                  <label className="field">
                    <span>Account anniversary month <small>(for the travel credit reset)</small></span>
                    <select value={anniv} onChange={(e) => store.setAnniversary(card.id, Number(e.target.value))}>
                      {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </label>
                )}

                {(hidden.length > 0 || gated.length > 0) && (
                  <div className="hidden-list">
                    {hidden.map((p) => (
                      <button key={p.id} className="pill" onClick={() => store.toggleHidden(p.id)}>+ {p.name}</button>
                    ))}
                    {gated.map((p) => {
                      const shown = state.hidden.includes(`show:${p.id}`)
                      return <button key={p.id} className={`pill ${shown ? 'pill-on' : ''}`} onClick={() => store.toggleHidden(`show:${p.id}`)}>{shown ? '− ' : '+ '}{p.name} <small>({p.gated})</small></button>
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
