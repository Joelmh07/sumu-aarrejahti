import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import FogLayer from './components/FogLayer'
import DiscoveryMarkers from './components/DiscoveryMarkers'
import LocationModal from './components/LocationModal'
import HUD from './components/HUD'
import Compass from './components/Compass'
import Logbook from './components/Logbook'
import Intro from './components/Intro'
import Toasts from './components/Toasts'
import Confetti from './components/Confetti'
import Victory from './components/Victory'
import { useGameState } from './hooks/useGameState'
import { sound } from './utils/sound'

const START = { lat: 59.85, lng: 22.95 } // Hangon edusta, retken lähtösatama
const BOUNDS = [[58.6, 17.0], [61.6, 30.5]]

function MapBridge({ onReady }) {
  const map = useMap()
  useEffect(() => onReady(map), [map, onReady])
  return null
}

function ClickToExplore({ onExplore }) {
  useMapEvents({ click: (e) => onExplore(e.latlng) })
  return null
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [map, setMap] = useState(null)
  const [selected, setSelected] = useState(null)
  const [logOpen, setLogOpen] = useState(false)
  const [spyglassMode, setSpyglassMode] = useState(false)
  const [muted, setMuted] = useState(false)
  const [toasts, setToasts] = useState([])
  const [burst, setBurst] = useState(0)
  const [victoryDismissed, setVictoryDismissed] = useState(false)
  const toastId = useRef(0)

  const pushToast = useCallback((toast) => {
    const id = ++toastId.current
    setToasts((t) => [...t.slice(-3), { ...toast, id }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), toast.kind === 'achievement' ? 4500 : 3200)
  }, [])

  const onDiscover = useCallback(
    (found) => {
      sound.discover()
      found.forEach((loc, i) =>
        setTimeout(() => pushToast({ kind: 'discover', icon: loc.emoji, title: `Löysit: ${loc.name}`, text: 'Avaa kohde ja ratkaise aarrevisa!' }), i * 350),
      )
      setTimeout(() => setSelected((cur) => cur ?? found[0]), 1100)
    },
    [pushToast],
  )

  const onAchievement = useCallback(
    (a) => {
      sound.achievement()
      setBurst(Date.now())
      pushToast({ kind: 'achievement', icon: a.emoji, title: `Saavutus: ${a.title}`, text: `${a.description} +1 🔭` })
    },
    [pushToast],
  )

  const game = useGameState({ onDiscover, onAchievement })
  const { state, reveal, answerQuiz, reset, complete } = game

  const hasSave = state.reveals.length > 1 || Object.keys(state.discovered).length > 0

  const start = () => {
    setStarted(true)
    if (state.reveals.length === 0) setTimeout(() => reveal(START), 600)
    setTimeout(() => pushToast({ kind: 'info', icon: '🌫️', title: 'Klikkaa sumua tutkiaksesi', text: 'Seuraa taikakompassia kohti aarteita.' }), 1400)
  }

  const explore = useCallback(
    (latlng) => {
      if (spyglassMode) {
        if (state.spyglasses <= 0) return
        sound.spyglass()
        reveal(latlng, true)
        setSpyglassMode(false)
      } else {
        sound.reveal()
        reveal(latlng)
      }
    },
    [spyglassMode, state.spyglasses, reveal],
  )

  const flyTo = useCallback(
    (loc) => {
      setLogOpen(false)
      map?.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 9), { duration: 1.2 })
      setTimeout(() => setSelected(loc), 1300)
    },
    [map],
  )

  const handleReset = () => {
    if (!window.confirm('Aloitetaanko uusi löytöretki? Nykyinen edistyminen nollataan.')) return
    reset()
    setVictoryDismissed(false)
    setSelected(null)
    map?.flyTo([59.95, 23.2], 8, { duration: 1 })
    setTimeout(() => reveal(START), 300)
  }

  const toggleMute = () => {
    sound.setMuted(!muted)
    setMuted(!muted)
  }

  return (
    <div className={`relative h-full w-full ${spyglassMode ? 'spyglass-cursor' : 'explore-cursor'}`}>
      <MapContainer
        center={[59.95, 23.2]}
        zoom={8}
        minZoom={6}
        maxZoom={13}
        maxBounds={BOUNDS}
        maxBoundsViscosity={0.8}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> -tekijät'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapBridge onReady={setMap} />
        <ClickToExplore onExplore={explore} />
        <DiscoveryMarkers discovered={state.discovered} onSelect={setSelected} />
        <FogLayer reveals={state.reveals} spyglassMode={spyglassMode} />
      </MapContainer>

      {/* Käyttöliittymäkerros kartan päällä */}
      <div className="pointer-events-none absolute inset-0 z-[1000]">
        {started && (
          <>
            <HUD
              game={game}
              spyglassMode={spyglassMode}
              onToggleSpyglass={() => setSpyglassMode((v) => !v)}
              onOpenLog={() => setLogOpen(true)}
              muted={muted}
              onToggleMute={toggleMute}
              onReset={handleReset}
            />
            <div className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 animate-slide-up">
              {spyglassMode && (
                <div className="pointer-events-auto rounded-full bg-amber-300 text-slate-900 px-4 py-1.5 text-sm font-semibold shadow-lg animate-glow">
                  🔭 Valitse kohta, jonka kaukoputki paljastaa
                </div>
              )}
              <Compass map={map} discovered={state.discovered} />
            </div>
            <div className="pointer-events-auto absolute bottom-8 right-3 sm:right-4 flex flex-col gap-1">
              <button onClick={() => map?.zoomIn()} className="zoom-btn" aria-label="Lähennä">+</button>
              <button onClick={() => map?.zoomOut()} className="zoom-btn" aria-label="Loitonna">−</button>
            </div>
          </>
        )}
      </div>

      <Toasts toasts={toasts} />
      <Confetti burst={burst} />

      <Logbook open={logOpen} onClose={() => setLogOpen(false)} game={game} onFlyTo={flyTo} />

      {selected && (
        <LocationModal
          key={selected.id}
          location={selected}
          status={state.discovered[selected.id]?.quiz ?? null}
          onAnswer={answerQuiz}
          onClose={() => setSelected(null)}
        />
      )}

      {complete && !victoryDismissed && !selected && (
        <Victory game={game} onClose={() => setVictoryDismissed(true)} onReset={handleReset} />
      )}

      {!started && <Intro onStart={start} hasSave={hasSave} />}
    </div>
  )
}
