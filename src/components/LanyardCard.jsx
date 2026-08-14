import { useEffect, useRef } from 'react'
import './LanyardCard.css'
import EditableMedia from './EditableMedia'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function LanyardCard({ image, alt = '', className = '' }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const cardRef = useRef(null)
  const stateRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0, angularVelocity: 0, dragging: false, pointerId: null, offsetX: 0, offsetY: 0 })
  const frameRef = useRef(0)
  const reducedRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const card = cardRef.current
    if (!root || !canvas || !card) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    reducedRef.current = query?.matches ?? false
    const onReducedChange = event => { reducedRef.current = event.matches }
    query?.addEventListener?.('change', onReducedChange)

    const resize = () => {
      const rect = root.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const getBounds = () => ({ width: root.clientWidth, height: root.clientHeight, cardWidth: card.offsetWidth, cardHeight: card.offsetHeight })
    const reset = () => {
      const bounds = getBounds()
      const state = stateRef.current
      state.x = bounds.width * .54
      state.y = Math.max(118, bounds.height * .52)
      state.vx = 0
      state.vy = 0
      state.angle = 0
      state.angularVelocity = 0
      card.style.transform = `translate3d(${state.x - bounds.cardWidth / 2}px, ${state.y - bounds.cardHeight / 2}px, 0) rotate(0deg)`
    }

    const pointerPosition = event => {
      const rect = root.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    const onPointerDown = event => {
      const point = pointerPosition(event)
      const bounds = getBounds()
      const state = stateRef.current
      state.dragging = true
      state.pointerId = event.pointerId
      state.offsetX = point.x - state.x
      state.offsetY = point.y - state.y
      state.vx = 0
      state.vy = 0
      card.setPointerCapture?.(event.pointerId)
      root.classList.add('is-dragging')
      card.style.transform = `translate3d(${state.x - bounds.cardWidth / 2}px, ${state.y - bounds.cardHeight / 2}px, 0) rotate(${state.angle}deg)`
    }

    const onPointerMove = event => {
      const state = stateRef.current
      if (!state.dragging || state.pointerId !== event.pointerId) return
      const point = pointerPosition(event)
      const bounds = getBounds()
      const nextX = clamp(point.x - state.offsetX, bounds.cardWidth * .4, bounds.width - bounds.cardWidth * .2)
      const nextY = clamp(point.y - state.offsetY, bounds.cardHeight * .55, bounds.height - bounds.cardHeight * .36)
      state.vx = nextX - state.x
      state.vy = nextY - state.y
      state.x = nextX
      state.y = nextY
    }

    const onPointerUp = event => {
      const state = stateRef.current
      if (state.pointerId !== event.pointerId) return
      state.dragging = false
      state.pointerId = null
      card.releasePointerCapture?.(event.pointerId)
      root.classList.remove('is-dragging')
    }

    const drawRope = (width, height, state) => {
      ctx.clearRect(0, 0, width, height)
      const anchor = { x: width * .54, y: 18 }
      const neck = { x: width * .54 + state.angle * 1.6, y: Math.max(82, state.y - 102) }
      const middle = { x: (anchor.x + neck.x) / 2 + state.vx * 1.7, y: (anchor.y + neck.y) / 2 + Math.sin(performance.now() * .002) * 4 }
      ctx.beginPath()
      ctx.moveTo(anchor.x, anchor.y)
      ctx.quadraticCurveTo(middle.x, middle.y, neck.x, neck.y)
      ctx.strokeStyle = 'rgba(255, 239, 196, .78)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(anchor.x, anchor.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#f9c965'
      ctx.fill()
    }

    const animate = () => {
      const bounds = getBounds()
      const state = stateRef.current
      if (!state.dragging && !reducedRef.current) {
        const restX = bounds.width * .54
        const restY = Math.max(118, bounds.height * .52)
        state.vy += (restY - state.y) * .012 + .12
        state.vx += (restX - state.x) * .012
        state.vx *= .91
        state.vy *= .91
        state.x += state.vx
        state.y += state.vy
        state.angularVelocity += (state.vx * .018 - state.angle * .035)
        state.angularVelocity *= .9
        state.angle += state.angularVelocity
      }
      const x = state.x - bounds.cardWidth / 2
      const y = state.y - bounds.cardHeight / 2
      card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${state.angle}deg)`
      drawRope(bounds.width, bounds.height, state)
      frameRef.current = requestAnimationFrame(animate)
    }

    const ro = new ResizeObserver(() => { resize(); reset() })
    ro.observe(root)
    resize()
    reset()
    root.addEventListener('pointerdown', onPointerDown)
    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerup', onPointerUp)
    root.addEventListener('pointercancel', onPointerUp)
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
      query?.removeEventListener?.('change', onReducedChange)
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerup', onPointerUp)
      root.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  return <div ref={rootRef} className={`lanyard-card ${className}`.trim()}><canvas ref={canvasRef} aria-hidden="true" /><div ref={cardRef} className="lanyard-card__card"><span className="lanyard-card__clip" /><EditableMedia src={image} alt={alt} className="lanyard-card__media" /><span className="lanyard-card__label">joker / visual identity</span></div></div>
}
