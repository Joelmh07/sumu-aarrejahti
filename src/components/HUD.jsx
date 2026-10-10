export default function HUD({ game, spyglassMode, onToggleSpyglass, onOpenLog, muted, onToggleMute, onReset }) {
  const { state, foundCount, total, level, rank, levelProgress } = game
  return (
    <>
      {/* Vasen yläkulma: pelaajan tila */}
      <div className="pointer-events-auto absolute top-3 left-3 sm:top-4 sm:left-4 w-[min(320px,calc(100vw-1.5rem))] rounded-2xl bg-slate-950/70 backdrop-blur-md ring-1 ring-white/10 p-4 shadow-2xl animate-slide-down">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 grid place-items-center text-2xl shadow-lg shadow-orange-500/30">
            🧭
            <span className="absolute -bottom-1.5 -right-1.5 h-6 min-w-6 px-1 rounded-full bg-slate-900 ring-2 ring-amber-300 text-[11px] font-bold text-amber-200 grid place-items-center">{level}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-extrabold tracking-wide text-amber-50 leading-none">LÖYTÖRETKI</h1>
            <div className="text-xs text-slate-300 mt-1">{rank} · <span className="text-amber-200 font-semibold">{state.xp} XP</span></div>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all duration-700" style={{ width: `${levelProgress * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="Löydöt" value={`${foundCount}/${total}`} />
          <Stat label="Retket" value={state.explorations} />
          <Stat label="Oikein" value={state.correct} />
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-sky-400 transition-all duration-700" style={{ width: `${(foundCount / total) * 100}%` }} />
        </div>
      </div>

      {/* Oikea yläkulma: työkalut */}
      <div className="pointer-events-auto absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2 animate-slide-down">
        <ToolButton onClick={onOpenLog} label="Lokikirja" icon="📜" />
        <ToolButton
          onClick={onToggleSpyglass}
          label={`Kaukoputki (${state.spyglasses})`}
          icon="🔭"
          active={spyglassMode}
          disabled={state.spyglasses <= 0 && !spyglassMode}
        />
        <ToolButton onClick={onToggleMute} label={muted ? 'Äänet pois' : 'Äänet päällä'} icon={muted ? '🔇' : '🔊'} compact />
        <ToolButton onClick={onReset} label="Uusi retki" icon="↺" compact />
      </div>
    </>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/5 py-1.5">
      <div className="text-base font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  )
}

function ToolButton({ onClick, label, icon, active, disabled, compact }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold backdrop-blur-md ring-1 shadow-xl transition-all active:scale-95
        ${active ? 'bg-amber-300 text-slate-900 ring-amber-200 shadow-amber-400/40 animate-glow' : 'bg-slate-950/70 text-slate-100 ring-white/10 hover:bg-slate-900/90 hover:ring-amber-200/40'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className={compact ? 'hidden lg:inline' : 'hidden sm:inline'}>{label}</span>
    </button>
  )
}
