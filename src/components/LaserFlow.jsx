import { useEffect, useRef } from 'react'

const VERTEX = `attribute vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }`
const FRAGMENT = `precision highp float;
uniform vec2 uResolution; uniform vec2 uPointer; uniform float uTime; uniform float uFade;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y); }
void main(){ vec2 uv=gl_FragCoord.xy/uResolution; vec2 p=uv-vec2(.5); float aspect=uResolution.x/uResolution.y; p.x*=aspect; vec2 mouse=(uPointer-vec2(.5)); mouse.x*=aspect; float t=uTime*.35; float bend=(mouse.x*.35)+sin(t*.7)*.08; float beam=exp(-pow(abs(p.y-(p.x*.42+bend+sin(p.x*4.+t)*.035)),2.)/(.0025+.012*abs(p.x))); float vertical=exp(-pow(abs(p.x-(mouse.x*.18+sin(t)*.04)),2.)/.012)*smoothstep(.95,-.1,p.y); float wisps=noise(vec2(p.x*5.-t*1.8,p.y*8.+t))*beam*1.5; float halo=exp(-length(p-mouse*.42)*4.0); float intensity=(beam*.7+vertical*.35+wisps*.25+halo*.2)*uFade; vec3 col=vec3(1.0,.33,.08)*intensity+vec3(1.0,.75,.35)*pow(intensity,2.); gl_FragColor=vec4(col, clamp(intensity,0.,.86)); }`

export default function LaserFlow({ image, alt }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const activeRef = useRef(false)
  const pointerRef = useRef({ x: .5, y: .5 })

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false })
    if (!canvas || !gl) return undefined
    const compile = (type, source) => { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); return shader }
    const program = gl.createProgram(); gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT)); gl.linkProgram(program); gl.useProgram(program)
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, 'uResolution'); const pointer = gl.getUniformLocation(program, 'uPointer'); const time = gl.getUniformLocation(program, 'uTime'); const fade = gl.getUniformLocation(program, 'uFade')
    let start = performance.now(); let fadeValue = 0; let targetFade = 0
    const resize = () => { const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 1.5); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; gl.viewport(0, 0, canvas.width, canvas.height) }
    const move = (event) => { const rect = canvas.getBoundingClientRect(); pointerRef.current = { x: (event.clientX - rect.left) / rect.width, y: 1 - (event.clientY - rect.top) / rect.height }; targetFade = 1 }
    const enter = move
    const leave = () => { targetFade = 0 }
    const draw = (now) => { fadeValue += (targetFade - fadeValue) * .09; gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform2f(resolution, canvas.width, canvas.height); gl.uniform2f(pointer, pointerRef.current.x, pointerRef.current.y); gl.uniform1f(time, (now - start) / 1000); gl.uniform1f(fade, fadeValue); gl.drawArrays(gl.TRIANGLES, 0, 3); frameRef.current = requestAnimationFrame(draw) }
    resize(); window.addEventListener('resize', resize); canvas.addEventListener('pointermove', move, { passive: true }); canvas.addEventListener('pointerenter', enter, { passive: true }); canvas.addEventListener('pointerleave', leave, { passive: true }); frameRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('resize', resize); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerenter', enter); canvas.removeEventListener('pointerleave', leave); gl.deleteProgram(program); gl.deleteBuffer(buffer) }
  }, [])

  return <div className="laser-flow"><img src={image} alt={alt} /><canvas ref={canvasRef} aria-hidden="true" /><span>Move through the light</span></div>
}
