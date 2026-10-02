import { useState, useRef, useEffect } from 'react'

export default function Menu({ store }) {
  const [open, setOpen] = useState(false)
  const file = useRef()
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const h = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', h)
    return () => document.removeEventListener('pointerdown', h)
  }, [open])
  return (
    <div ref={ref} className="menu-wrap">
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu">⋯</button>
      {open && (
        <div className="menu">
          <button onClick={() => { store.exportJSON(); setOpen(false) }}>Download backup</button>
          <button onClick={() => file.current.click()}>Restore backup</button>
          <button className="danger" onClick={() => { if (confirm('Clear all tracked usage and settings on this device?')) { store.reset(); setOpen(false) } }}>Start over</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { if (e.target.files[0]) store.importJSON(e.target.files[0]); e.target.value = ''; setOpen(false) }} />
        </div>
      )}
    </div>
  )
}
