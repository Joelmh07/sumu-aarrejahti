import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import locations from '../data/locations.json'
import achievements from '../data/achievements.json'
import { distanceMeters } from '../utils/geo'

const STORAGE_KEY = 'loytoretki-save-v1'
export const REVEAL_RADIUS = 25000 // metriä, tavallinen tutkimus
export const SPYGLASS_RADIUS = 70000 // metriä, kaukoputki
export const START_SPYGLASSES = 3
export const XP_PER_LEVEL = 300

const RANKS = ['Jungmanni', 'Matruusi', 'Puosu', 'Perämies', 'Luotsi', 'Kapteeni', 'Kommodori', 'Amiraali']

const initialState = () => ({
  reveals: [], // { lat, lng, r, t }
  discovered: {}, // id -> { at, quiz: null | 'correct' | 'wrong' }
  xp: 0,
  correct: 0,
  explorations: 0,
  spyglasses: START_SPYGLASSES,
  unlocked: {}, // achievementId -> timestamp
})

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { ...initialState(), ...parsed }
  } catch {
    return null
  }
}

function evaluateAchievements(state) {
  const found = Object.keys(state.discovered)
  const newly = []
  for (const a of achievements) {
    if (state.unlocked[a.id]) continue
    let ok = false
    if (a.type === 'discovered') {
      const target = a.target === 'all' ? locations.length : a.target
      ok = found.length >= target
    } else if (a.type === 'category') {
      const inCat = locations.filter((l) => l.category === a.category)
      ok = inCat.length > 0 && inCat.every((l) => state.discovered[l.id])
    } else if (a.type === 'correct') {
      ok = state.correct >= a.target
    }
    if (ok) newly.push(a)
  }
  return newly
}

export function useGameState({ onDiscover, onAchievement } = {}) {
  const [state, setState] = useState(() => load() ?? initialState())
  // Ref pitää aina tuoreimman tilan, jotta sivuvaikutukset (toastit, äänet) eivät ole setState-päivittäjän sisällä.
  const stateRef = useRef(state)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* tallennus ei ole saatavilla, peli toimii silti */
    }
  }, [state])

  const commit = useCallback(
    (next) => {
      const newly = evaluateAchievements(next)
      if (newly.length) {
        const unlocked = { ...next.unlocked }
        newly.forEach((a) => (unlocked[a.id] = Date.now()))
        // Jokainen saavutus antaa yhden lisäkaukoputken.
        next = { ...next, unlocked, spyglasses: next.spyglasses + newly.length }
        newly.forEach((a, i) => setTimeout(() => onAchievement?.(a), 900 + i * 1200))
      }
      stateRef.current = next
      setState(next)
    },
    [onAchievement],
  )

  /** Paljastaa alueen sumun alta. Palauttaa löydetyt kohteet. */
  const reveal = useCallback(
    (latlng, useSpyglass = false) => {
      const prev = stateRef.current
      if (useSpyglass && prev.spyglasses <= 0) return []
      const r = useSpyglass ? SPYGLASS_RADIUS : REVEAL_RADIUS
      const point = { lat: latlng.lat, lng: latlng.lng, r, t: Date.now() }
      const found = locations.filter((l) => !prev.discovered[l.id] && distanceMeters(point, l) <= r)
      const discovered = { ...prev.discovered }
      found.forEach((l) => (discovered[l.id] = { at: Date.now(), quiz: null }))
      commit({
        ...prev,
        reveals: [...prev.reveals, point],
        discovered,
        explorations: prev.explorations + 1,
        spyglasses: useSpyglass ? prev.spyglasses - 1 : prev.spyglasses,
        xp: prev.xp + found.reduce((s, l) => s + Math.round(l.xp / 2), 0),
      })
      if (found.length) setTimeout(() => onDiscover?.(found), 450)
      return found
    },
    [commit, onDiscover],
  )

  const answerQuiz = useCallback(
    (id, correct) => {
      const prev = stateRef.current
      const entry = prev.discovered[id]
      if (!entry || entry.quiz) return
      const loc = locations.find((l) => l.id === id)
      commit({
        ...prev,
        discovered: { ...prev.discovered, [id]: { ...entry, quiz: correct ? 'correct' : 'wrong' } },
        correct: prev.correct + (correct ? 1 : 0),
        xp: prev.xp + (correct ? loc.xp : Math.round(loc.xp / 5)),
      })
    },
    [commit],
  )

  const reset = useCallback(() => {
    const fresh = initialState()
    stateRef.current = fresh
    setState(fresh)
  }, [])

  const derived = useMemo(() => {
    const foundCount = Object.keys(state.discovered).length
    const level = Math.floor(state.xp / XP_PER_LEVEL) + 1
    return {
      foundCount,
      total: locations.length,
      level,
      rank: RANKS[Math.min(level - 1, RANKS.length - 1)],
      levelProgress: (state.xp % XP_PER_LEVEL) / XP_PER_LEVEL,
      complete: foundCount === locations.length,
    }
  }, [state])

  return { state, ...derived, reveal, answerQuiz, reset }
}
