import { CARDS, GUIDE } from '../data/cards.js'

export default function GuidePage({ activeCards }) {
  const byId = Object.fromEntries(CARDS.map((c) => [c.id, c]))
  const active = new Set(activeCards.map((c) => c.id))
  return (
    <div className="guide">
      <p className="lede">Which card to pull out so every dollar earns the most, and the credits get used.</p>
      {GUIDE.filter((g) => active.has(g.card)).map((g) => {
        const c = byId[g.card]
        return (
          <div key={g.what} className={`guide-row theme-${c.theme}`}>
            <div className="guide-what">{g.what}</div>
            <div className="guide-card"><span className="swatch" />{c.name}</div>
            <div className="guide-why">{g.why}</div>
          </div>
        )
      })}
      <div className="guide-note">
        <b>Stacking tips</b>
        <ul>
          <li>Both Amex Uber Cash credits land in the same Uber wallet. Add both cards and you get $25 a month ($45 in December).</li>
          <li>Resy: pay the first $100 of a quarter’s Resy meals with the Platinum, then $50 per half with the Gold.</li>
          <li>DoorDash: link the Sapphire Reserve for DashPass and the three monthly promos. The Freedom Unlimited promo is a bonus only if you run a second DoorDash account.</li>
          <li>Global Entry: two cards, two credits. Cover a partner or parent’s application with the second one.</li>
          <li>Hotel credits: FHR via Amex (Platinum, $300 per half) and The Edit via Chase ($250 per booking). Pick the one whose period is closer to ending.</li>
        </ul>
      </div>
    </div>
  )
}
