import { useCallback, useEffect, useRef } from 'react'
import './ProfileCard.css'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function ProfileCard({
  avatarUrl,
  name = 'Joker',
  title = 'AI Designer · Visual Storyteller',
  handle = 'jokers.space',
  status = 'Available for select projects',
  contactText = 'Start a project',
  onContactClick
}) {
  const wrapRef = useRef(null)
  const targetRef = useRef({ x: 50, y: 50 })
  const currentRef = useRef({ x: 50, y: 50 })
  const frameRef = useRef(0)
  const leaveTimerRef = useRef(0)
  const reducedRef = useRef(false)

  const paint = useCallback(() => {
    const node = wrapRef.current
    if (!node) return

    const current = currentRef.current
    const target = targetRef.current
    current.x += (target.x - current.x) * 0.16
    current.y += (target.y - current.y) * 0.16

    node.style.setProperty('--pointer-x', `${current.x}%`)
    node.style.setProperty('--pointer-y', `${current.y}%`)
    node.style.setProperty('--rotate-x', `${((50 - current.y) * 0.16).toFixed(2)}deg`)
    node.style.setProperty('--rotate-y', `${((current.x - 50) * 0.2).toFixed(2)}deg`)

    const settled = Math.abs(target.x - current.x) < 0.05 && Math.abs(target.y - current.y) < 0.05
    if (!settled && !reducedRef.current) {
      frameRef.current = requestAnimationFrame(paint)
    } else {
      frameRef.current = 0
    }
  }, [])

  const requestPaint = useCallback(() => {
    if (!frameRef.current && !reducedRef.current) frameRef.current = requestAnimationFrame(paint)
  }, [paint])

  const handlePointerMove = useCallback(event => {
    const node = wrapRef.current
    if (!node || reducedRef.current) return
    const rect = node.getBoundingClientRect()
    targetRef.current = {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100)
    }
    node.classList.add('is-active')
    if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current)
    requestPaint()
  }, [requestPaint])

  const handlePointerEnter = useCallback(() => {
    wrapRef.current?.classList.add('is-active')
  }, [])

  const handlePointerLeave = useCallback(() => {
    const node = wrapRef.current
    if (!node || reducedRef.current) return
    targetRef.current = { x: 50, y: 50 }
    requestPaint()
    if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current)
    leaveTimerRef.current = window.setTimeout(() => node.classList.remove('is-active'), 420)
  }, [requestPaint])

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const updateReduced = () => {
      reducedRef.current = Boolean(query?.matches)
      if (reducedRef.current) {
        targetRef.current = { x: 50, y: 50 }
        currentRef.current = { x: 50, y: 50 }
        paint()
      }
    }

    updateReduced()
    query?.addEventListener?.('change', updateReduced)
    return () => {
      query?.removeEventListener?.('change', updateReduced)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current)
    }
  }, [paint])

  return (
    <article
      ref={wrapRef}
      className="profile-card"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="pc-behind-glow" aria-hidden="true" />
      <div className="pc-card-shell">
        <div className="pc-card-surface">
          <div className="pc-card-shine" aria-hidden="true" />
          <div className="pc-card-glare" aria-hidden="true" />
          <div className="pc-card-topline">
            <span>Profile / 001</span>
            <span className="pc-status-dot">● online</span>
          </div>
          <div className="pc-avatar-frame">
            <img src={avatarUrl} alt={`${name} profile`} draggable="false" />
            <span className="pc-avatar-ring" aria-hidden="true" />
            <span className="pc-avatar-label">J / AI</span>
          </div>
          <div className="pc-card-details">
            <div>
              <span className="pc-card-kicker">The mind behind the images</span>
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
            <div className="pc-user-line">
              <div className="pc-mini-avatar"><img src={avatarUrl} alt="" aria-hidden="true" /></div>
              <div><strong>@{handle}</strong><span>{status}</span></div>
            </div>
          </div>
          <button className="pc-contact" type="button" onClick={onContactClick}>{contactText}<span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </article>
  )
}
