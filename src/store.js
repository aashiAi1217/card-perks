import { useEffect, useState, useCallback } from 'react'

const KEY = 'card-perks:v1'

const DEFAULT = {
  usage: {},          // { [perkId]: { [periodKey]: { used: number, done: bool, at: iso } } }
  hidden: [],         // perk ids the user hid
  disabledCards: [],  // card ids the user doesn't hold
  anniversary: {},    // { [cardId]: month 1-12 }
  firstSeen: null,
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT, firstSeen: new Date().toISOString() }
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT }
  }
}

export function useStore() {
  const [state, setState] = useState(load)
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)) }, [state])

  const getUsage = useCallback((perkId, periodKey) => state.usage[perkId]?.[periodKey] ?? null, [state.usage])

  const setUsage = useCallback((perkId, periodKey, patch) => {
    setState((s) => {
      const prev = s.usage[perkId]?.[periodKey] ?? { used: 0, done: false }
      const next = { ...prev, ...patch, at: new Date().toISOString() }
      return { ...s, usage: { ...s.usage, [perkId]: { ...(s.usage[perkId] ?? {}), [periodKey]: next } } }
    })
  }, [])

  const clearUsage = useCallback((perkId, periodKey) => {
    setState((s) => {
      const p = { ...(s.usage[perkId] ?? {}) }
      delete p[periodKey]
      return { ...s, usage: { ...s.usage, [perkId]: p } }
    })
  }, [])

  const toggleHidden = useCallback((perkId) => {
    setState((s) => ({ ...s, hidden: s.hidden.includes(perkId) ? s.hidden.filter((x) => x !== perkId) : [...s.hidden, perkId] }))
  }, [])

  const toggleCard = useCallback((cardId) => {
    setState((s) => ({ ...s, disabledCards: s.disabledCards.includes(cardId) ? s.disabledCards.filter((x) => x !== cardId) : [...s.disabledCards, cardId] }))
  }, [])

  const setAnniversary = useCallback((cardId, month) => {
    setState((s) => ({ ...s, anniversary: { ...s.anniversary, [cardId]: month } }))
  }, [])

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `card-perks-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }, [state])

  const importJSON = useCallback((file) => {
    const r = new FileReader()
    r.onload = () => {
      try {
        const data = JSON.parse(r.result)
        setState((s) => {
          // merge usage, never delete
          const usage = { ...s.usage }
          for (const [pid, periods] of Object.entries(data.usage ?? {})) usage[pid] = { ...(usage[pid] ?? {}), ...periods }
          return { ...s, ...data, usage, hidden: [...new Set([...(s.hidden), ...(data.hidden ?? [])])] }
        })
        alert('Backup restored.')
      } catch { alert('That file is not a valid backup.') }
    }
    r.readAsText(file)
  }, [])

  const reset = useCallback(() => setState({ ...DEFAULT, firstSeen: new Date().toISOString() }), [])

  return { state, getUsage, setUsage, clearUsage, toggleHidden, toggleCard, setAnniversary, exportJSON, importJSON, reset }
}
