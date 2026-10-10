import { useState } from 'react'
import locations from '../data/locations.json'
import achievements from '../data/achievements.json'
import categories from '../data/categories.json'

export default function Logbook({ open, onClose, game, onFlyTo }) {
  const [tab, setTab] = useState('loydot')
  const { state, foundCount, total } = game

  return (
    <>
      <div className={`fixed inset-0 z-[1100] bg-slate-950/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <aside
        className={`fixed top-0 right-0 z-[1101] h-full w-full sm:w-[420px] bg-gradient-to-b from-[#f3e6c8] to-[#e6d3a8] text-[#3b2a17] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="paper absolute inset-0 pointer-events-none" />
        <div className="relative h-full flex flex-col">
          <header className="px-6 pt-6 pb-4 border-b border-[#3b2a17]/15">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[#8a6a3a]">Kapteenin</div>
                <h2 className="font-display text-3xl font-extrabold">Lokikirja</h2>
              </div>
              <button onClick={onClose} aria-label="Sulje" className="h-9 w-9 rounded-full bg-[#3b2a17]/10 hover:bg-[#3b2a17]/20 transition">✕</button>
            </div>
            <p className="mt-2 text-sm text-[#5b4426]">
              Löydetty <b>{foundCount}</b> / {total} kohdetta · {state.xp} XP · 🔭 {state.spyglasses}
            </p>
            <div className="mt-4 flex gap-2">
              {[['loydot', '🗺️ Löydöt'], ['saavutukset', '🏅 Saavutukset']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === id ? 'bg-[#3b2a17] text-amber-100' : 'bg-[#3b2a17]/10 hover:bg-[#3b2a17]/20'}`}>
                  {label}
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {tab === 'loydot' ? (
              <ul className="space-y-2">
                {locations.map((loc, i) => {
                  const d = state.discovered[loc.id]
                  const cat = categories[loc.category]
                  if (!d) {
                    return (
                      <li key={loc.id} className="flex items-center gap-3 rounded-xl border border-dashed border-[#3b2a17]/25 px-3 py-2.5 text-[#8a6a3a]">
                        <span className="h-10 w-10 grid place-items-center rounded-lg bg-[#3b2a17]/10 text-lg">❔</span>
                        <span className="italic">Tuntematon kohde #{i + 1}</span>
                      </li>
                    )
                  }
                  return (
                    <li key={loc.id}>
                      <button onClick={() => onFlyTo(loc)} className="w-full flex items-center gap-3 rounded-xl bg-white/50 hover:bg-white/80 ring-1 ring-[#3b2a17]/10 px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-md">
                        <span className="h-10 w-10 grid place-items-center rounded-lg text-xl" style={{ background: `${cat.color}40` }}>{loc.emoji}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold truncate">{loc.name}</span>
                          <span className="block text-xs text-[#7a5a2a]">{cat.label} · {loc.rarity}</span>
                        </span>
                        <span className="text-lg" title={d.quiz ? 'Visa tehty' : 'Visa tekemättä'}>
                          {d.quiz === 'correct' ? '🏆' : d.quiz === 'wrong' ? '📘' : '❗'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <ul className="grid grid-cols-2 gap-3">
                {achievements.map((a) => {
                  const got = state.unlocked[a.id]
                  return (
                    <li key={a.id} className={`rounded-2xl p-3 text-center ring-1 transition ${got ? 'bg-gradient-to-b from-amber-200 to-amber-300/70 ring-amber-500/40 shadow-md' : 'bg-[#3b2a17]/5 ring-[#3b2a17]/10 opacity-70'}`}>
                      <div className={`text-3xl ${got ? '' : 'grayscale opacity-50'}`}>{a.emoji}</div>
                      <div className="mt-1 font-bold text-sm">{a.title}</div>
                      <div className="text-xs text-[#6b4f28] mt-0.5">{a.description}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <footer className="px-6 py-4 border-t border-[#3b2a17]/15 text-xs text-[#6b4f28]">
            💚 Teema: Itämeren suojelu ja merellinen kulttuuri, John Nurmisen Säätiön hengessä.
          </footer>
        </div>
      </aside>
    </>
  )
}
