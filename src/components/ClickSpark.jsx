import { useEffect, useRef } from 'react'

export default function ClickSpark({ children, color = '#fff2bc' }) {
  const canvasRef = useRef(null)
  const sparksRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return undefined
    let frame = 0
    const resize = () => { canvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2); canvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2); canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`; ctx.setTransform(Math.min(window.devicePixelRatio || 1, 2), 0, 0, Math.min(window.devicePixelRatio || 1, 2), 0, 0) }
    const click = (event) => { const now = performance.now(); sparksRef.current.push(...Array.from({ length: 8 }, (_, index) => ({ x: event.clientX, y: event.clientY, angle: index * Math.PI / 4, start: now }))) }
    const draw = (now) => { ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); sparksRef.current = sparksRef.current.filter((spark) => { const progress = (now - spark.start) / 430; if (progress >= 1) return false; const eased = progress * (2 - progress); const distance = eased * 18; const length = 10 * (1 - eased); ctx.globalAlpha = 1 - progress; ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(spark.x + Math.cos(spark.angle) * distance, spark.y + Math.sin(spark.angle) * distance); ctx.lineTo(spark.x + Math.cos(spark.angle) * (distance + length), spark.y + Math.sin(spark.angle) * (distance + length)); ctx.stroke(); return true }); ctx.globalAlpha = 1; frame = requestAnimationFrame(draw) }
    resize(); window.addEventListener('resize', resize); window.addEventListener('click', click); frame = requestAnimationFrame(draw)
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('click', click); cancelAnimationFrame(frame) }
  }, [color])

  return <div className="click-spark-root"><canvas ref={canvasRef} className="click-spark-canvas" aria-hidden="true" />{children}</div>
}
