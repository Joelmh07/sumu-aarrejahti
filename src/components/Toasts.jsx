export default function Toasts({ toasts }) {
  return (
    <div className="pointer-events-none fixed top-24 sm:top-6 left-1/2 -translate-x-1/2 z-[1300] flex flex-col items-center gap-2 w-[min(92vw,420px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl ring-1 backdrop-blur-md animate-toast
            ${t.kind === 'achievement' ? 'bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 ring-amber-100' : t.kind === 'discover' ? 'bg-teal-900/85 text-teal-50 ring-teal-300/40' : 'bg-slate-900/85 text-slate-100 ring-white/10'}`}
        >
          <span className="text-3xl">{t.icon}</span>
          <div className="min-w-0">
            <div className="font-bold leading-tight">{t.title}</div>
            {t.text && <div className="text-sm opacity-80">{t.text}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
