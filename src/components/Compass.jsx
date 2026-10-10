import { useEffect, useState } from 'react'
import locations from '../data/locations.json'
import { bearing, bearingToText, distanceMeters } from '../utils/geo'

function heat(d) {
  if (d < 25000) return { label: 'Polttaa!', color: '#ff6b6b', glow: 'shadow-rose-500/60' }
  if (d < 60000) return { label: 'Kuuma', color: '#f4a261', glow: 'shadow-orange-500/50' }
  if (d < 120000) return { label: 'Lämmin', color: '#e9c46a', glow: 'shadow-amber-400/40' }
  return { label: 'Kylmä', color: '#8ecae6', glow: 'shadow-sky-400/30' }
}

/** Taikakompassi osoittaa kartan keskeltä lähimpään löytämättömään kohteeseen. */
export default function Compass({ map, discovered }) {
  const [center, setCenter] = useState(null)

  useEffect(() => {
    if (!map) return
    const update = () => setCenter(map.getCenter())
    update()
    map.on('move', update)
    return () => map.off('move', update)
  }, [map])

  if (!center) return null
  const remaining = locations.filter((l) => !discovered[l.id])
  if (!remaining.length) return null

  let nearest = remaining[0]
  let best = Infinity
  for (const l of remaining) {
    const d = distanceMeters(center, l)
    if (d < best) { best = d; nearest = l }
  }
  const deg = bearing(center, nearest)
  const h = heat(best)

  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-slate-950/70 backdrop-blur-md ring-1 ring-white/10 pl-2 pr-4 py-2 shadow-xl">
      <div className={`relative h-14 w-14 rounded-full bg-gradient-to-b from-[#173a5c] to-[#0a1b2e] ring-2 ring-amber-200/50 shadow-lg ${h.glow}`}>
        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-200">P</span>
        <div className="absolute inset-0 transition-transform duration-700 ease-out" style={{ transform: `rotate(${deg}deg)` }}>
          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[20px] border-l-transparent border-r-transparent" style={{ borderBottomColor: h.color }} />
          <div className="absolute left-1/2 bottom-2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[20px] border-l-transparent border-r-transparent border-t-slate-500" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100" />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-widest text-slate-400">Taikakompassi</div>
        <div className="font-display font-bold text-lg" style={{ color: h.color }}>{h.label}</div>
        <div className="text-xs text-slate-300">Jotain piilee {bearingToText(deg)}</div>
      </div>
    </div>
  )
}
