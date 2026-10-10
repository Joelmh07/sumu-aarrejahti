import { useEffect, useMemo, useState } from 'react'
import categories from '../data/categories.json'
import { shuffleQuiz } from '../utils/geo'
import { sound } from '../utils/sound'

const RARITY_STYLE = {
  tavallinen: 'bg-slate-500/30 text-slate-200 ring-slate-400/40',
  harvinainen: 'bg-sky-500/25 text-sky-200 ring-sky-400/40',
  legendaarinen: 'bg-amber-400/25 text-amber-200 ring-amber-300/50',
}

export default function LocationModal({ location, status, onAnswer, onClose }) {
  const quiz = useMemo(() => shuffleQuiz(location.quiz), [location])
  const [picked, setPicked] = useState(null)
  const answered = status != null || picked != null
  const cat = categories[location.category]

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function pick(i) {
    if (answered) return
    setPicked(i)
    const ok = i === quiz.answer
    ok ? sound.correct() : sound.wrong()
    onAnswer(location.id, ok)
  }

  const resultOk = picked != null ? picked === quiz.answer : status === 'correct'

  return (
    <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#12304d] to-[#0a1b2e] ring-1 ring-amber-200/20 shadow-2xl shadow-black/60 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-36 overflow-hidden rounded-t-3xl" style={{ background: `radial-gradient(circle at 30% 20%, ${cat.color}55, transparent 60%), linear-gradient(135deg, #0e3a5c, #071624)` }}>
          <div className="absolute inset-0 waves opacity-40" />
          <div className="absolute left-6 bottom-4 flex items-end gap-4">
            <div className="text-6xl drop-shadow-lg animate-float">{location.emoji}</div>
            <div className="pb-1">
              <div className="flex flex-wrap gap-2 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1" style={{ color: cat.color, background: `${cat.color}22`, borderColor: cat.color }}>{cat.label}</span>
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${RARITY_STYLE[location.rarity]}`}>{location.rarity}</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-amber-50 leading-tight">{location.name}</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Sulje" className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/30 hover:bg-black/50 text-white text-lg transition">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-slate-200 leading-relaxed">{location.story}</p>

          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-200/90">🎯 Aarrevisa</h3>
              <span className="text-xs text-slate-400">+{location.xp} XP oikeasta vastauksesta</span>
            </div>
            <p className="font-medium text-white mb-3">{quiz.question}</p>
            <div className="grid gap-2">
              {quiz.options.map((opt, i) => {
                const isRight = i === quiz.answer
                const isPicked = i === picked
                let style = 'bg-white/5 hover:bg-white/10 ring-white/10 hover:ring-amber-200/40 text-slate-100'
                if (answered && picked != null) {
                  if (isRight) style = 'bg-emerald-500/20 ring-emerald-400 text-emerald-100'
                  else if (isPicked) style = 'bg-rose-500/20 ring-rose-400 text-rose-100 animate-shake'
                  else style = 'bg-white/5 ring-white/5 text-slate-400'
                } else if (status != null) {
                  style = isRight ? 'bg-emerald-500/15 ring-emerald-400/60 text-emerald-100' : 'bg-white/5 ring-white/5 text-slate-400'
                }
                return (
                  <button
                    key={i}
                    disabled={answered}
                    onClick={() => pick(i)}
                    className={`text-left px-4 py-3 rounded-xl ring-1 transition-all duration-200 ${style} ${!answered ? 'hover:translate-x-1' : ''}`}
                  >
                    <span className="mr-2 text-amber-200/70 font-semibold">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {answered && (
              <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in ${resultOk ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/10 text-amber-100'}`}>
                {resultOk
                  ? `🏆 Oikein! Aarre on kirjattu lokikirjaasi.`
                  : `🌊 Lähellä! Oikea vastaus on merkitty vihreällä. Sait silti hieman kokemusta.`}
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-amber-500/20">
            {answered ? 'Jatka löytöretkeä ⛵' : 'Palaa kartalle'}
          </button>
        </div>
      </div>
    </div>
  )
}
