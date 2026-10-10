export default function Intro({ onStart, hasSave }) {
  return (
    <div className="fixed inset-0 z-[1500] grid place-items-center overflow-hidden bg-[#06121f] text-white animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1b4d73_0%,transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 waves-big opacity-60" />
      <div className="absolute inset-0 stars" />

      <div className="relative max-w-xl px-6 text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-amber-200 to-orange-500 grid place-items-center text-5xl shadow-[0_0_80px_rgba(244,162,97,0.5)] animate-float">🧭</div>
        <div className="text-xs uppercase tracking-[0.5em] text-amber-200/80">Itämeren sumu-aarrejahti</div>
        <h1 className="font-display mt-3 text-5xl sm:text-7xl font-extrabold tracking-wide bg-gradient-to-b from-amber-50 to-amber-300 bg-clip-text text-transparent drop-shadow">LÖYTÖRETKI</h1>
        <p className="mt-5 text-slate-300 leading-relaxed">
          Saaristo on kadonnut sankan meri-sumun alle. Purjehdi sumuun, paljasta majakat, hylyt ja salaiset saaret,
          ratkaise aarrevisat ja opi, miten Itämerta suojellaan.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 text-left text-sm">
          {[
            ['👆', 'Klikkaa sumua', 'paljastaaksesi alueen'],
            ['🧭', 'Seuraa kompassia', 'se kuumenee kohteen lähellä'],
            ['🔭', 'Kaukoputki', 'paljastaa laajan alueen kerralla'],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 backdrop-blur">
              <div className="text-2xl">{icon}</div>
              <div className="mt-1 font-semibold text-amber-100">{title}</div>
              <div className="text-xs text-slate-400">{text}</div>
            </div>
          ))}
        </div>

        <button onClick={onStart} className="mt-10 group relative inline-flex items-center gap-3 rounded-full px-10 py-4 text-lg font-bold text-slate-900 bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 shadow-[0_10px_40px_rgba(244,162,97,0.45)] hover:scale-105 active:scale-95 transition">
          {hasSave ? 'Jatka retkeä' : 'Lähde löytöretkelle'}
          <span className="transition-transform group-hover:translate-x-1">⛵</span>
        </button>
        <p className="mt-6 text-xs text-slate-500">Karttadata © OpenStreetMapin tekijät</p>
      </div>
    </div>
  )
}
