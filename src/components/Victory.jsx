export default function Victory({ game, onClose, onReset }) {
  const { state, rank } = game
  return (
    <div className="fixed inset-0 z-[1350] grid place-items-center bg-slate-950/70 backdrop-blur p-6 animate-fade-in">
      <div className="max-w-md w-full text-center rounded-3xl bg-gradient-to-b from-[#173a5c] to-[#0a1b2e] ring-1 ring-amber-200/30 p-8 shadow-2xl animate-pop-in">
        <div className="text-7xl animate-float">👑</div>
        <h2 className="font-display mt-4 text-3xl font-extrabold text-amber-100">Itämeren legenda!</h2>
        <p className="mt-3 text-slate-300">
          Paljastit koko saariston sumun alta. Arvonimesi on <b className="text-amber-200">{rank}</b>.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Big label="XP" value={state.xp} />
          <Big label="Retkiä" value={state.explorations} />
          <Big label="Oikein" value={state.correct} />
        </div>
        <p className="mt-6 text-sm text-teal-200/90">
          Muista: Itämeri voi paremmin, kun mereen päätyy vähemmän ravinteita. Jokainen teko lasketaan. 💚
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white transition">Ihaile karttaa</button>
          <button onClick={onReset} className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 hover:brightness-110 transition">Uusi retki</button>
        </div>
      </div>
    </div>
  )
}

function Big({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 py-3">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  )
}
