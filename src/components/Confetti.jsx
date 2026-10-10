import { useMemo } from 'react'

const COLORS = ['#e9c46a', '#f4a261', '#2ec4b6', '#8ecae6', '#ffffff', '#c77dff']

export default function Confetti({ burst }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 1.6,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 200,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst],
  )
  if (!burst) return null
  return (
    <div key={burst} className="pointer-events-none fixed inset-0 z-[1400] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.45,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--rot': `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  )
}
