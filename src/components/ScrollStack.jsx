import { useEffect } from 'react'
import './ScrollStack.css'

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
)

export function WorkflowStackEnhancer() {
  useEffect(() => {
    const stack = document.querySelector('.workflow-steps')
    if (!stack) return undefined
    const cards = Array.from(stack.children)
    const reduceQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    let reduced = reduceQuery?.matches ?? false
    let frame = 0

    cards.forEach((card, index) => {
      card.classList.add('scroll-stack-card')
      card.style.setProperty('--stack-index', index)
    })

      const update = () => {
      frame = 0
      if (reduced) {
        cards.forEach(card => { card.style.transform = 'none' })
        return
      }
      const stackTop = window.innerHeight * 0.18
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect()
        const progress = Math.min(1, Math.max(0, (stackTop - rect.top) / Math.max(1, rect.height * .78)))
        const targetScale = .86 + index * .025
        const scale = 1 - progress * (1 - targetScale)
        const rotation = index % 2 ? progress * 1.2 : progress * -1.2
        card.style.transform = `translate3d(0, 0, 0) scale(${scale}) rotate(${rotation}deg)`
        card.style.setProperty('--stack-progress', progress)
      })
    }

    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update) }
    const onReducedChange = event => { reduced = event.matches; requestUpdate() }
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate, { passive: true })
    reduceQuery?.addEventListener?.('change', onReducedChange)
    requestUpdate()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      reduceQuery?.removeEventListener?.('change', onReducedChange)
    }
  }, [])

  return null
}

export default function ScrollStack({ children, className = '' }) {
  return <div className={`scroll-stack ${className}`.trim()}>{children}</div>
}
