// Pienet äänitehosteet Web Audio API:lla, ei ulkoisia tiedostoja.
let ctx = null
let muted = false

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, { duration = 0.2, type = 'sine', gain = 0.12, delay = 0, slide = 0 } = {}) {
  const ac = audio()
  if (!ac || muted) return
  const t = ac.currentTime + delay
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, t + duration)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

function noise({ duration = 0.6, gain = 0.06 } = {}) {
  const ac = audio()
  if (!ac || muted) return
  const buffer = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  const g = ac.createGain()
  g.gain.value = gain
  src.connect(filter).connect(g).connect(ac.destination)
  src.start()
}

export const sound = {
  setMuted(v) { muted = v },
  isMuted() { return muted },
  reveal() { noise({ duration: 0.5, gain: 0.05 }); tone(220, { duration: 0.35, slide: 1.6, gain: 0.05 }) },
  discover() { [523, 659, 784, 1047].forEach((f, i) => tone(f, { delay: i * 0.08, duration: 0.25, type: 'triangle' })) },
  correct() { tone(660, { duration: 0.15, type: 'triangle' }); tone(990, { delay: 0.12, duration: 0.3, type: 'triangle' }) },
  wrong() { tone(220, { duration: 0.35, type: 'sawtooth', gain: 0.05, slide: 0.6 }) },
  achievement() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, { delay: i * 0.1, duration: 0.4, type: 'triangle', gain: 0.1 })) },
  spyglass() { tone(300, { duration: 0.8, slide: 3, gain: 0.06 }); noise({ duration: 0.9, gain: 0.04 }) },
}
