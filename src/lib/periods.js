// Period helpers. Every perk lives in a "period" determined by its cadence.
// A period has a key (used to store usage), a start, an end and a label.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY = 86400000

const endOfMonth = (y, m) => new Date(y, m + 1, 0, 23, 59, 59, 999) // m is 0-based

export function periodFor(cadence, now = new Date(), annivMonth = 1) {
  const y = now.getFullYear()
  const m = now.getMonth() // 0-based
  switch (cadence) {
    case 'monthly':
      return { key: `${y}-${String(m + 1).padStart(2, '0')}`, start: new Date(y, m, 1), end: endOfMonth(y, m), label: `${MONTHS[m]} ${y}` }
    case 'quarterly': {
      const q = Math.floor(m / 3)
      return { key: `${y}-Q${q + 1}`, start: new Date(y, q * 3, 1), end: endOfMonth(y, q * 3 + 2), label: `Q${q + 1} ${y}` }
    }
    case 'semiannual': {
      const h = m < 6 ? 0 : 1
      return { key: `${y}-H${h + 1}`, start: new Date(y, h * 6, 1), end: endOfMonth(y, h * 6 + 5), label: h === 0 ? `Jan–Jun ${y}` : `Jul–Dec ${y}` }
    }
    case 'annual':
      return { key: `${y}`, start: new Date(y, 0, 1), end: endOfMonth(y, 11), label: `${y}` }
    case 'anniversary': {
      const am = Math.min(12, Math.max(1, annivMonth)) - 1
      const startYear = m >= am ? y : y - 1
      const start = new Date(startYear, am, 1)
      const end = new Date(startYear + 1, am, 0, 23, 59, 59, 999)
      return { key: `A${startYear}-${am + 1}`, start, end, label: `${MONTHS[am]} ${startYear} – ${MONTHS[(am + 11) % 12]} ${startYear + 1}` }
    }
    case 'once':
    case 'ongoing':
    default:
      return { key: 'once', start: null, end: null, label: 'One-time' }
  }
}

export function daysLeft(period, now = new Date()) {
  if (!period.end) return null
  return Math.max(0, Math.ceil((period.end - now) / DAY))
}

export function fmtDate(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function perkAmount(perk, now = new Date()) {
  if (perk.amount == null) return null
  if (perk.cadence === 'monthly' && perk.amountByMonth) {
    const o = perk.amountByMonth[now.getMonth() + 1]
    if (o != null) return o
  }
  return perk.amount
}

export function isExpired(perk, now = new Date()) {
  return perk.expires ? new Date(perk.expires + 'T23:59:59') < now : false
}

// Yearly value of a perk (for fee math)
export function annualValue(perk) {
  if (perk.amount == null) return 0
  const mult = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1, anniversary: 1, once: 0, ongoing: 0 }[perk.cadence] ?? 0
  let v = perk.amount * mult
  if (perk.cadence === 'monthly' && perk.amountByMonth) {
    for (const [mo, amt] of Object.entries(perk.amountByMonth)) v += amt - perk.amount
  }
  return v
}

// All period keys of a cadence that fall inside a calendar year (for "captured this year")
export function periodKeysInYear(cadence, year, annivMonth = 1) {
  const keys = new Set()
  for (let m = 0; m < 12; m++) keys.add(periodFor(cadence, new Date(year, m, 15), annivMonth).key)
  return [...keys]
}

export const money = (n) => {
  if (n == null) return ''
  const r = Math.round(n * 100) / 100
  return '$' + r.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
