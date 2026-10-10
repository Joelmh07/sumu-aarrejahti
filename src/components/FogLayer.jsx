import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

const MAX_DPR = 1.5
const GROW_MS = 900

/** Tekee pehmeän, ajelehtivan sumutekstuurin, jota toistetaan kuviona. */
function makeCloudTexture(size = 512) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 30 + Math.random() * 110
    const a = 0.03 + Math.random() * 0.06
    // Piirretään jokainen pilvi myös reunojen yli, jotta kuvio jatkuu saumattomasti.
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const grad = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r)
        grad.addColorStop(0, `rgba(170, 200, 225, ${a})`)
        grad.addColorStop(1, 'rgba(170, 200, 225, 0)')
        g.fillStyle = grad
        g.beginPath()
        g.arc(x + dx, y + dy, r, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
  return c
}

/**
 * Sumukerros: canvas kartan päällä. Paljastetut alueet leikataan sumusta
 * pehmeäreunaisina ympyröinä. Hiiren kohdalla on heikko "lyhdyn" kajo.
 */
export default function FogLayer({ reveals, spyglassMode }) {
  const map = useMap()
  const revealsRef = useRef(reveals)
  const spyRef = useRef(spyglassMode)
  revealsRef.current = reveals
  spyRef.current = spyglassMode

  useEffect(() => {
    const container = map.getContainer()
    const canvas = document.createElement('canvas')
    canvas.className = 'fog-canvas'
    container.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    const cloud = makeCloudTexture()
    const cloud2 = makeCloudTexture(384)
    const pattern = ctx.createPattern(cloud, 'repeat')
    const pattern2 = ctx.createPattern(cloud2, 'repeat')

    let w = 0, h = 0, margin = 0, dpr = 1
    let raf = 0
    let animating = false
    let mouse = null
    const seen = new Map() // reveal-avain -> aika jolloin animaatio alkoi

    function resize() {
      const size = map.getSize()
      w = size.x
      h = size.y
      margin = Math.round(Math.max(w, h) / 2)
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = (w + margin * 2) * dpr
      canvas.height = (h + margin * 2) * dpr
      canvas.style.width = `${w + margin * 2}px`
      canvas.style.height = `${h + margin * 2}px`
      canvas.style.left = `${-margin}px`
      canvas.style.top = `${-margin}px`
      canvas.style.transformOrigin = `${margin}px ${margin}px`
      onMove()
    }

    function onMove() {
      const topLeft = map.containerPointToLayerPoint([0, 0])
      L.DomUtil.setPosition(canvas, topLeft)
    }

    function metersToPixels(lat, lng, meters) {
      const p1 = map.latLngToContainerPoint([lat, lng])
      const p2 = map.latLngToContainerPoint([lat + meters / 111320, lng])
      return { x: p1.x, y: p1.y, r: Math.abs(p1.y - p2.y) }
    }

    function draw(now) {
      raf = requestAnimationFrame(draw)
      if (animating) return
      const W = w + margin * 2
      const H = h + margin * 2
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, W, H)

      // Perussumu
      const base = ctx.createLinearGradient(0, 0, 0, H)
      base.addColorStop(0, 'rgba(8, 20, 38, 0.93)')
      base.addColorStop(1, 'rgba(14, 34, 56, 0.93)')
      ctx.fillStyle = base
      ctx.fillRect(0, 0, W, H)

      // Kaksi eri nopeudella ajelehtivaa pilvikerrosta
      const t = now / 1000
      ctx.save()
      ctx.translate((t * 12) % 512, (t * 5) % 512)
      ctx.fillStyle = pattern
      ctx.fillRect(-512, -512, W + 1024, H + 1024)
      ctx.restore()
      ctx.save()
      ctx.translate(-((t * 7) % 384), (t * 9) % 384)
      ctx.fillStyle = pattern2
      ctx.fillRect(-384, -384, W + 768, H + 768)
      ctx.restore()

      // Leikataan paljastetut alueet
      ctx.globalCompositeOperation = 'destination-out'
      const rings = []
      for (const rv of revealsRef.current) {
        const key = `${rv.lat},${rv.lng},${rv.t}`
        if (!seen.has(key)) seen.set(key, Date.now() - rv.t > 3000 ? -Infinity : now)
        const start = seen.get(key)
        const k = Math.min(1, (now - start) / GROW_MS)
        const ease = 1 - Math.pow(1 - k, 3)
        const p = metersToPixels(rv.lat, rv.lng, rv.r)
        const r = Math.max(1, p.r * ease)
        const x = p.x + margin
        const y = p.y + margin
        if (x + r < 0 || y + r < 0 || x - r > W || y - r > H) continue
        const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r)
        g.addColorStop(0, 'rgba(0,0,0,1)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        if (k < 1) rings.push({ x, y, r, k })
      }

      // Lyhdyn kajo hiiren kohdalla
      if (mouse) {
        const lr = spyRef.current ? 150 : 70
        const g = ctx.createRadialGradient(mouse.x + margin, mouse.y + margin, 0, mouse.x + margin, mouse.y + margin, lr)
        g.addColorStop(0, `rgba(0,0,0,${spyRef.current ? 0.5 : 0.35})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(mouse.x + margin, mouse.y + margin, lr, 0, Math.PI * 2)
        ctx.fill()
      }

      // Kultainen aalto juuri paljastuneen alueen reunalla
      ctx.globalCompositeOperation = 'source-over'
      for (const ring of rings) {
        ctx.strokeStyle = `rgba(233, 196, 106, ${0.9 * (1 - ring.k)})`
        ctx.lineWidth = 3 + 6 * (1 - ring.k)
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // Leafletin zoom-animaation aikana canvasta skaalataan CSS:llä, jotta sumu pysyy kartan mukana.
    function onZoomAnim(e) {
      const scale = map.getZoomScale(e.zoom, map.getZoom())
      const half = map.getSize().divideBy(2)
      const pc = map.project(map.getCenter(), map.getZoom())
      const pn = map.project(e.center, e.zoom)
      const tx = (pc.x - half.x) * scale - pn.x + half.x
      const ty = (pc.y - half.y) * scale - pn.y + half.y
      animating = true
      canvas.style.transition = 'transform 0.25s cubic-bezier(0,0,0.25,1)'
      canvas.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`
    }
    function onZoomEnd() {
      canvas.style.transition = 'none'
      canvas.style.transform = ''
      animating = false
      onMove()
    }
    function onMouseMove(e) { mouse = e.containerPoint }
    function onMouseOut() { mouse = null }

    resize()
    map.on('resize', resize)
    map.on('move', onMove)
    map.on('zoomanim', onZoomAnim)
    map.on('zoomend', onZoomEnd)
    map.on('mousemove', onMouseMove)
    map.on('mouseout', onMouseOut)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      map.off('resize', resize)
      map.off('move', onMove)
      map.off('zoomanim', onZoomAnim)
      map.off('zoomend', onZoomEnd)
      map.off('mousemove', onMouseMove)
      map.off('mouseout', onMouseOut)
      canvas.remove()
    }
  }, [map])

  return null
}