import { useEffect, useMemo, useRef, useState } from 'react'
import './DriftWall.css'
import EditableMedia from './EditableMedia'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const columnFactor = (index, variance) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1
  return 1 + variance * pseudo
}

export default function DriftWall({
  items = [],
  columns = 5,
  tileWidth = 250,
  tileHeight = 165,
  gap = 18,
  speed = 38,
  direction = 'up',
  variance = 0.34,
  parallax = 0.7,
  pauseOnHover = false,
  className = ''
}) {
  const containerRef = useRef(null)
  const planeRef = useRef(null)
  const trackRefs = useRef([])
  const offsetsRef = useRef([])
  const lastTimeRef = useRef(null)
  const rafRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0 })
  const pointerDampedRef = useRef({ x: 0, y: 0 })
  const hoveredColumnRef = useRef(-1)
  const hoveredWallRef = useRef(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return undefined
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  const columnItems = useMemo(() => {
    if (!items.length) return Array.from({ length: columns }, () => [])
    return Array.from({ length: columns }, (_, columnIndex) => {
      const start = (columnIndex * 3) % items.length
      const reversed = columnIndex % 2 === 1
      return items.map((_, index) => {
        const offset = reversed ? -index : index
        return items[(start + offset + items.length * 2) % items.length]
      })
    })
  }, [columns, items])

  const columnMeta = useMemo(() => {
    const copyHeight = tileHeight + gap
    return columnItems.map(column => ({
      copyHeight: Math.max(copyHeight, column.length * copyHeight),
      copies: 5
    }))
  }, [columnItems, gap, tileHeight])

  const velocities = useMemo(() => {
    const sign = direction === 'down' ? -1 : 1
    return columnItems.map((_, index) => sign * speed * columnFactor(index, variance) * (index % 2 ? -1 : 1))
  }, [columnItems, direction, speed, variance])

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, index) => meta.copyHeight * ((index * 0.37) % 1))
  }, [columnMeta])

  useEffect(() => {
    const animate = timestamp => {
      const previous = lastTimeRef.current ?? timestamp
      const dt = Math.min(0.05, Math.max(0, timestamp - previous) / 1000)
      lastTimeRef.current = timestamp

      const pointer = pointerRef.current
      const damp = 1 - Math.exp(-dt / 0.12)
      pointerDampedRef.current.x += (pointer.x - pointerDampedRef.current.x) * damp
      pointerDampedRef.current.y += (pointer.y - pointerDampedRef.current.y) * damp

      if (planeRef.current && !reduced) {
        const px = pointerDampedRef.current.x * parallax * 7
        const py = -pointerDampedRef.current.y * parallax * 5
        planeRef.current.style.transform = `translate(-50%, -50%) rotateX(${8 + py}deg) rotateY(${-8 + px}deg) rotateZ(-2deg)`
      }

      columnMeta.forEach((meta, index) => {
        const track = trackRefs.current[index]
        if (!track || reduced) return
        const paused = pauseOnHover && hoveredWallRef.current
        const columnPaused = hoveredColumnRef.current === index
        const velocity = paused || columnPaused ? 0 : velocities[index]
        const next = ((offsetsRef.current[index] ?? 0) + velocity * dt) % meta.copyHeight
        offsetsRef.current[index] = (next + meta.copyHeight) % meta.copyHeight
        track.style.transform = `translate3d(0, ${-offsetsRef.current[index]}px, 0)`
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [columnMeta, parallax, pauseOnHover, reduced, velocities])

  const handlePointerMove = event => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    pointerRef.current = {
      x: clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5),
      y: clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5)
    }
    const tile = event.target.closest?.('[data-drift-column]')
    hoveredColumnRef.current = tile ? Number(tile.dataset.driftColumn) : -1
  }

  const resetPointer = () => {
    pointerRef.current = { x: 0, y: 0 }
    hoveredColumnRef.current = -1
    hoveredWallRef.current = false
  }

  return (
    <div
      ref={containerRef}
      className={`drift-wall${reduced ? ' is-reduced' : ''} ${className}`.trim()}
      style={{ '--dw-tile-w': `${tileWidth}px`, '--dw-tile-h': `${tileHeight}px`, '--dw-gap': `${gap}px` }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => { hoveredWallRef.current = true }}
      onPointerLeave={resetPointer}
      role="group"
      aria-label="A drifting wall of selected images"
    >
      <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((column, columnIndex) => {
          const copies = Array.from({ length: columnMeta[columnIndex].copies })
          return (
            <div className="drift-wall__column" key={`column-${columnIndex}`} data-drift-column={columnIndex}>
              <div className="drift-wall__track" ref={element => { trackRefs.current[columnIndex] = element }}>
                {copies.map((_, copyIndex) => column.map((item, itemIndex) => (
                  <div
                    className="drift-wall__tile"
                    key={`${columnIndex}-${copyIndex}-${itemIndex}`}
                    data-drift-column={columnIndex}
                    tabIndex={0}
                    title={item.title}
                    onFocus={() => { hoveredColumnRef.current = columnIndex }}
                    onBlur={() => { hoveredColumnRef.current = -1 }}
                  >
                    <EditableMedia src={item.image} alt={item.title} className="drift-wall__media" />
                    <span>{item.title}</span>
                  </div>
                )))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="drift-wall__topline"><span>Interactive study / 001</span><span>Move through the image</span></div>
      <div className="drift-wall__bottomline"><span>Selected visual fragments</span><span>Hover a column to hold the frame</span></div>
    </div>
  )
}
