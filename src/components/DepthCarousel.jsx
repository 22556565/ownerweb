import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './DepthCarousel.css'
import EditableMedia from './EditableMedia'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function DepthCarousel({ items = [], className = '' }) {
  const rootRef = useRef(null)
  const dragRef = useRef(null)
  const [active, setActive] = useState(0)
  const [position, setPosition] = useState(0)
  const [reduced, setReduced] = useState(false)
  const data = useMemo(() => items.filter(Boolean), [items])

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return undefined
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  const focus = useCallback((next, animate = true) => {
    if (!data.length) return
    const index = (next + data.length) % data.length
    setActive(index)
    setPosition(index)
    if (!animate || reduced) setPosition(index)
  }, [data.length, reduced])

  const handlePointerDown = event => {
    if (event.target.closest?.('.media-replace-input')) return
    if (data.length < 2) return
    dragRef.current = { id: event.pointerId, x: event.clientX, start: position, moved: false }
    rootRef.current?.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = event => {
    const drag = dragRef.current
    if (!drag) return
    const delta = event.clientX - drag.x
    if (Math.abs(delta) > 5) drag.moved = true
    if (!drag.moved) return
    const step = Math.max(150, rootRef.current?.clientWidth * .48 || 260)
    setPosition(drag.start - delta / step)
  }

  const handlePointerEnd = event => {
    if (event?.target?.closest?.('.media-replace-input')) return
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (!drag.moved) return
    focus(Math.round(position), true)
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root || data.length < 2) return undefined
    const wheel = event => {
      event.preventDefault()
      focus(active + (event.deltaY > 0 || event.deltaX > 0 ? 1 : -1))
    }
    root.addEventListener('wheel', wheel, { passive: false })
    return () => root.removeEventListener('wheel', wheel)
  }, [active, data.length, focus])

  if (!data.length) return null

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${reduced ? 'is-reduced' : ''} ${className}`.trim()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') focus(active - 1)
        if (event.key === 'ArrowRight') focus(active + 1)
      }}
      tabIndex={0}
      role="region"
      aria-label="Visual practice carousel"
    >
      <div className="depth-carousel__stage">
        {data.map((item, index) => {
          let distance = index - position
          const count = data.length
          if (distance > count / 2) distance -= count
          if (distance < -count / 2) distance += count
          const back = Math.max(0, distance)
          const visible = Math.abs(distance) <= 3
          const x = distance * 76
          const z = -distance * 190
          const rotate = clamp(distance, -1, 1) * 14
          const scale = 1 - Math.min(.18, Math.abs(distance) * .055)
          const opacity = visible ? Math.max(0, 1 - Math.max(0, -distance) * .82) : 0
          return <article key={`${item.image}-${index}`} className="depth-carousel__card" style={{ '--x': `${x}px`, '--z': `${z}px`, '--rotate': `${rotate}deg`, '--scale': scale, '--opacity': opacity, '--depth': `${100 - index}` }} onClick={event => { if (!event.target.closest?.('.media-replace-input')) focus(index) }} aria-hidden={active !== index}><EditableMedia src={item.image} alt={item.alt || ''} /><span className="depth-carousel__veil" /><span className="depth-carousel__number">0{index + 1}</span></article>
        })}
      </div>
      <button type="button" className="depth-carousel__arrow depth-carousel__arrow--prev" onClick={() => focus(active - 1)} aria-label="上一张">←</button>
      <button type="button" className="depth-carousel__arrow depth-carousel__arrow--next" onClick={() => focus(active + 1)} aria-label="下一张">→</button>
      <div className="depth-carousel__dots" role="tablist" aria-label="Visual practice slides">{data.map((item, index) => <button type="button" key={item.image} className={active === index ? 'is-active' : ''} onClick={() => focus(index)} aria-label={`查看第 ${index + 1} 张图片`} aria-selected={active === index} role="tab" />)}</div>
    </div>
  )
}
