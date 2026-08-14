import { useRef, useState } from 'react'
import './TiltedCard.css'
import EditableMedia from './EditableMedia'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function TiltedCard({ imageSrc, altText = '', captionText = 'JOKER / 001', className = '' }) {
  const ref = useRef(null)
  const [style, setStyle] = useState({ rx: 0, ry: 0, scale: 1, x: 0, y: 0, opacity: 0 })
  const handleMove = event => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const ox = (event.clientX - rect.left) / rect.width - .5
    const oy = (event.clientY - rect.top) / rect.height - .5
    setStyle({ rx: clamp(oy * -12, -14, 14), ry: clamp(ox * 14, -14, 14), scale: 1.045, x: (ox + .5) * rect.width, y: (oy + .5) * rect.height, opacity: 1 })
  }
  const reset = () => setStyle({ rx: 0, ry: 0, scale: 1, x: 0, y: 0, opacity: 0 })
  return <figure ref={ref} className={`tilted-card ${className}`.trim()} onPointerMove={handleMove} onPointerLeave={reset}><div className="tilted-card__inner" style={{ transform: `perspective(1000px) rotateX(${style.rx}deg) rotateY(${style.ry}deg) scale(${style.scale})` }}><EditableMedia src={imageSrc} alt={altText} /><span className="tilted-card__shine" /></div><figcaption style={{ left: style.x, top: style.y, opacity: style.opacity, transform: `translate(-50%, -50%) rotate(${style.ry * -.35}deg)` }}>{captionText}</figcaption></figure>
}
