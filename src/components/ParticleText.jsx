import { useEffect, useRef } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const easeOut = (value) => 1 - Math.pow(1 - value, 3)

export default function ParticleText({ text, className = '', fontSize = 'clamp(5rem, 13vw, 12rem)', color = '#fff8ee', highlightColor = '#ffb43c' }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    if (!root || !canvas || !ctx) return undefined

    let width = 0
    let height = 0
    let dpr = 1
    let particles = []
    let frame = 0
    let build = 0
    let reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const pointer = { active: false, x: 0, y: 0 }

    const sample = async () => {
      const currentBuild = ++build
      const rect = root.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const probe = document.createElement('span')
      probe.textContent = 'M'
      probe.style.cssText = `position:absolute;visibility:hidden;font:${800} ${fontSize} Manrope, sans-serif`
      root.appendChild(probe)
      const resolvedSize = parseFloat(getComputedStyle(probe).fontSize) || 120
      probe.remove()
      const offscreen = document.createElement('canvas')
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
      const font = `800 ${resolvedSize}px Manrope, Arial, sans-serif`
      offCtx.font = font
      const metrics = offCtx.measureText(text)
      const pad = Math.max(16, resolvedSize * .12)
      offscreen.width = Math.ceil(metrics.width + pad * 2)
      offscreen.height = Math.ceil(resolvedSize * 1.2 + pad * 2)
      offCtx.font = font
      offCtx.textBaseline = 'alphabetic'
      offCtx.fillStyle = '#fff'
      offCtx.fillText(text, pad, pad + resolvedSize)
      const data = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data
      const step = Math.max(3, Math.floor(width < 800 ? 4 : 3.2))
      const targets = []
      for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
          if (data[(y * offscreen.width + x) * 4 + 3] > 50) targets.push({ x: width / 2 - offscreen.width / 2 + x, y: height / 2 - offscreen.height / 2 + y })
        }
      }
      if (currentBuild !== build) return
      const limit = Math.min(targets.length, width < 800 ? 1100 : 2400)
      const stride = Math.max(1, Math.ceil(targets.length / limit))
      particles = targets.filter((_, index) => index % stride === 0).map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280
        const angle = seed * Math.PI * 2
        const distance = reduceMotion ? 0 : 100 + seed * 170
        return { ...target, x: target.x + Math.cos(angle) * distance, y: target.y + Math.sin(angle) * distance, targetX: target.x, targetY: target.y, seed, start: performance.now() + seed * 500 }
      })
    }

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((particle) => {
        const progress = reduceMotion ? 1 : clamp((now - particle.start) / 1200, 0, 1)
        const eased = easeOut(progress)
        let x = particle.x + (particle.targetX - particle.x) * eased
        let y = particle.y + (particle.targetY - particle.y) * eased
        if (!reduceMotion && progress >= 1) {
          x = particle.targetX + Math.sin(now * .001 + particle.seed * 8) * .65
          y = particle.targetY + Math.cos(now * .0008 + particle.seed * 9) * .65
        }
        if (pointer.active && !reduceMotion) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance < 130 && distance > 0) {
            const force = Math.pow(1 - distance / 130, 2) * 32
            x += dx / distance * force
            y += dy / distance * force
          }
        }
        const amount = clamp((progress + .25) / 1.25, 0, 1)
        ctx.fillStyle = amount > .55 && particle.seed > .78 ? highlightColor : color
        ctx.globalAlpha = .22 + amount * .78
        ctx.fillRect(x, y, 1.7, 1.7)
      })
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    const onMove = (event) => { const rect = canvas.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true }
    const onLeave = () => { pointer.active = false }
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const onReduceChange = (event) => { reduceMotion = event.matches; sample() }
    const observer = new ResizeObserver(sample)
    observer.observe(root)
    canvas.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('pointerleave', onLeave, { passive: true })
    query?.addEventListener('change', onReduceChange)
    sample()
    frame = requestAnimationFrame(draw)

    return () => { build += 1; observer.disconnect(); query?.removeEventListener('change', onReduceChange); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); cancelAnimationFrame(frame) }
  }, [text, fontSize, color, highlightColor])

  return <div ref={rootRef} className={`particle-text ${className}`} aria-label={text}><canvas ref={canvasRef} aria-hidden="true" /><span>{text}</span></div>
}
