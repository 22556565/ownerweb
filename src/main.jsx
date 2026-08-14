import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowUpRight, CircleArrowUp, Mail, Menu, Phone, Play, X } from 'lucide-react'
import ClickSpark from './components/ClickSpark'
import DepthCarousel from './components/DepthCarousel'
import DriftWall from './components/DriftWall'
import EditableMedia from './components/EditableMedia'
import LanyardCard from './components/LanyardCard'
import LaserFlow from './components/LaserFlow'
import ParticleText from './components/ParticleText'
import ProfileCard from './components/ProfileCard'
import TiltedCard from './components/TiltedCard'
import { WorkflowStackEnhancer } from './components/ScrollStack'
import './styles.css'

const A = '/assets/'
const projects = [
  { id: 'stage', type: 'feature', tag: 'LIVE VISUAL / 01', title: '让想象，活在有光的世界里', description: '舞台视觉与情绪设计，把现场的呼吸变成可以被看见的光。', image: `${A}55acda53a85daa4aff9ba4dfd30549f9.png`, video: `${A}35d696252bd37915ecb9263e7b1c550f.mp4`, tone: 'violet' },
  { id: 'memory', type: 'poster', tag: 'POSTER / 02', title: '记忆的回声', description: '为一段关于舞台、凝视与回到现场的记忆，留下新的构图。', image: `${A}3f584c457daa3b86ad9ca542df95c67d.png`, tone: 'ink' },
  { id: 'red', type: 'poster', tag: 'POSTER / 03', title: '赤 · 现场', description: '红色不是答案，是打开现场的第一道门。', image: `${A}a70df35806e90e91a3cd4f49c5f6658f.png`, tone: 'red' },
  { id: 'portrait', type: 'poster', tag: 'IMAGE / 04', title: '成为光的一部分', description: '人物、舞台与观看者之间，短暂而具体的连接。', image: `${A}99bc88d85e4a2e1ee4d06444811e2101.png`, tone: 'warm' },
  { id: 'echo', type: 'wide', tag: 'MOTION / 05', title: '回声穿过屏幕', description: '用影像捕捉瞬间，让一帧画面拥有继续发生的余温。', image: `${A}e9ce2409ade0d77a8d3675a9df236cdf.png`, video: `${A}7e6e4e7dacdd7ccabbbef0404d7d71be.mp4`, tone: 'blue' }
]
const loopSources = [`${A}35d696252bd37915ecb9263e7b1c550f.mp4`, `${A}66422ec900b2465e38b97e5670593773.mp4`, `${A}7e6e4e7dacdd7ccabbbef0404d7d71be.mp4`]

const practiceItems = [
  { image: `${A}035d0797e13ee670612febf4a5f01477.png`, alt: 'Visual world' },
  { image: `${A}c901e44df74767d28c6f692496371b92.png`, alt: 'Motion language' },
  { image: `${A}d482450cfdf77f6f292e991a7cdd5cb1.png`, alt: 'Human feeling' },
  { image: `${A}5c7d48d3b72046c08ffbf76ae8abdce0.png`, alt: 'Material study' },
  { image: `${A}fd66d650b5f5d986baa9f76faaff728b.png`, alt: 'Signal study' }
]

const archiveStackItems = [
  `${A}55acda53a85daa4aff9ba4dfd30549f9.png`,
  `${A}035d0797e13ee670612febf4a5f01477.png`,
  `${A}3f584c457daa3b86ad9ca542df95c67d.png`,
  `${A}a70df35806e90e91a3cd4f49c5f6658f.png`,
  `${A}e9ce2409ade0d77a8d3675a9df236cdf.png`
]

function MediaEditorEnhancer() {
  useEffect(() => {
    const decorated = new Map()
    const decorate = media => {
      if (!media || media.closest('.editable-media') || decorated.has(media)) return
      const host = media.parentElement
      if (!host) return
      const button = document.createElement('button')
      const input = document.createElement('input')
      const original = media.src
      const urlRef = { value: '' }
      button.type = 'button'
      button.className = 'media-replace-button media-replace-button--enhanced'
      button.title = 'Replace media'
      button.setAttribute('aria-label', 'Replace media')
      button.textContent = '↗'
      input.type = 'file'
      input.accept = media.tagName === 'VIDEO' ? 'video/*' : 'image/*'
      input.className = 'media-replace-input'
      host.style.position = host.style.position || 'relative'
      button.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        input.click()
      })
      input.addEventListener('change', event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        if (urlRef.value) URL.revokeObjectURL(urlRef.value)
        urlRef.value = URL.createObjectURL(file)
        media.src = urlRef.value
        media.setAttribute('data-local-preview', 'true')
        if (media.tagName === 'VIDEO') {
          media.load()
          media.play().catch(() => {})
        }
      })
      host.append(button, input)
      decorated.set(media, { button, input, original, urlRef })
    }
    const scan = () => document.querySelectorAll('main img, main video').forEach(decorate)
    scan()
    const observer = new MutationObserver(scan)
    observer.observe(document.querySelector('main') || document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      decorated.forEach(({ button, input, urlRef }) => {
        button.remove()
        input.remove()
        if (urlRef.value) URL.revokeObjectURL(urlRef.value)
      })
      decorated.clear()
    }
  }, [])
  return null
}

function AboutDepthEnhancer() {
  useEffect(() => {
    const original = document.querySelector('#about .principles')
    if (!original || original.dataset.enhanced) return undefined
    original.dataset.enhanced = 'true'
    original.style.display = 'none'
    const host = document.createElement('div')
    host.className = 'principles-carousel-host'
    original.parentElement.insertBefore(host, original)
    const root = createRoot(host)
    root.render(<DepthCarousel items={practiceItems} />)
    return () => { root.unmount(); host.remove(); original.style.display = '' }
  }, [])
  return null
}

function ArchiveImageStack() {
  const ref = useRef(null)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return undefined
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  useEffect(() => {
    const node = ref.current
    if (!node || reduced) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      const progress = Math.max(-1, Math.min(1, (window.innerHeight * .72 - rect.top) / Math.max(1, window.innerHeight * .8)))
      node.style.setProperty('--stack-progress', progress)
    }
    const request = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request, { passive: true })
    request()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', request); window.removeEventListener('resize', request) }
  }, [reduced])
  return <div ref={ref} className={`archive-image-stack${reduced ? ' is-reduced' : ''}`} aria-label="Selected archive image sequence">{archiveStackItems.map((image, index) => <img key={image} src={image} alt="" style={{ '--stack-index': index }} />)}<span>scroll through the archive / 01</span></div>
}

function ArchiveImageStackEnhancer() {
  useEffect(() => {
    const original = document.querySelector('.work-cover-image')
    if (!original || original.dataset.enhanced) return undefined
    original.dataset.enhanced = 'true'
    original.innerHTML = ''
    const host = document.createElement('div')
    original.appendChild(host)
    const root = createRoot(host)
    root.render(<ArchiveImageStack />)
    return () => { root.unmount(); host.remove(); original.dataset.enhanced = '' }
  }, [])
  return null
}

function Navigation({ menuOpen, setMenuOpen }) { const links = [['01', '角色介绍', '#about'], ['02', '作品案例', '#work'], ['03', '互动体验', '#lab'], ['04', '联系方式', '#contact']]; return <header className="site-nav"><a className="brand" href="#top" aria-label="返回首页"><span className="brand-mark">j</span><span>joker&apos;s<br />space</span></a><nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="主导航">{links.map(([number, label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}><small>{number}</small><span>{label}</span><i aria-hidden="true" /></a>)}</nav><a className="nav-contact" href="mailto:hello@jokers.space">Start a conversation <ArrowUpRight size={16} /></a><button className="menu-toggle" type="button" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></header> }
function Hero({ menuOpen, setMenuOpen }) { const [loaded, setLoaded] = useState(false); return <section className="hero" id="top"><EditableMedia kind="video" className="hero-video" src={`${A}66422ec900b2465e38b97e5670593773.mp4`} alt="Hero motion background" accept="video/*" onReady={() => setLoaded(true)} /><div className={loaded ? 'hero-wash is-loaded' : 'hero-wash'} /><Navigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><div className="hero-grid" aria-hidden="true" /><div className="hero-copy"><p className="eyebrow"><span className="live-dot" /> AI designer · visual storyteller</p><div className="hero-particle-title"><ParticleText text="joker's space" fontSize="clamp(5rem, 12.4vw, 12.8rem)" color="#fff9f2" highlightColor="#f9c965" /></div><p className="hero-intro">我用 AI、影像和直觉，<br />把还没有发生的世界先做出来。</p><a className="round-link" href="#work" aria-label="浏览作品案例"><ArrowDown size={22} /></a></div><LanyardCard image={`${A}99bc88d85e4a2e1ee4d06444811e2101.png`} alt="Joker visual identity card" /><div className="hero-foot"><span>Based in China · Working everywhere</span><span>Scroll to explore <ArrowDown size={15} /></span></div></section> }
function About() { return <section className="about section-shell" id="about"><div className="about-shell"><div className="about-topline"><span>01 / The character</span><span>AI designer · visual storyteller</span></div><div className="about-hero"><div className="about-word" aria-hidden="true">JOKER</div><div className="about-hero-image"><TiltedCard imageSrc={`${A}5e9652ee721383880ea71b96111a1043.png`} altText="Joker 在银色未来感舞台中的视觉肖像" captionText="JOKER / 001 · VISUAL IDENTITY" /></div><div className="about-hero-copy"><span className="eyebrow">The mind behind the images</span><h2>让想象<br /><em>先发生。</em></h2><p>我是 Joker，一名 AI 设计师。我在真实和虚构之间工作，把模糊的念头变成值得被记住的视觉体验。</p><a href="#work">Explore the work <ArrowUpRight size={15} /></a></div></div><div className="about-feature-heading"><div><span className="eyebrow">A visual practice</span><h3>我正在创造的<br /><em>三种可能。</em></h3></div><p>用图像搭建情绪，<br />用动态捕捉呼吸。</p></div><div className="principles"><div className="principle-card principle-cyan"><div className="principle-image"><img src={`${A}035d0797e13ee670612febf4a5f01477.png`} alt="舞台视觉与光影创作" /></div><span>01 / Visual world</span><strong>意图先行</strong><p>先问为什么，再决定如何呈现。</p><a href="#work" aria-label="查看视觉世界作品"><ArrowUpRight size={17} /></a></div><div className="principle-card principle-purple"><div className="principle-image"><img src={`${A}c901e44df74767d28c6f692496371b92.png`} alt="抽象影像与动态创作" /></div><span>02 / Motion language</span><strong>保留意外</strong><p>让技术给直觉留一点偏航的空间。</p><a href="#lab" aria-label="体验互动光场"><ArrowUpRight size={17} /></a></div><div className="principle-card principle-orange"><div className="principle-image"><img src={`${A}d482450cfdf77f6f292e991a7cdd5cb1.png`} alt="人物与情绪视觉创作" /></div><span>03 / Human feeling</span><strong>触摸真实</strong><p>每个画面都要有可以停留的情绪。</p><a href="#contact" aria-label="联系 Joker"><ArrowUpRight size={17} /></a></div></div><AboutDepthEnhancer /><div className="about-bottomline"><span>01 / 03</span><span>Designing with curiosity</span><span>Keep scrolling ↓</span></div></div></section> }
function MediaCard({ project, index, onOpen }) { const cardRef = useRef(null); const handleMove = event => { const card = cardRef.current; if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 800) return; const rect = card.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - .5; const y = (event.clientY - rect.top) / rect.height - .5; card.style.setProperty('--rx', `${y * -4}deg`); card.style.setProperty('--ry', `${x * 5}deg`); card.style.setProperty('--mx', `${x * 12}px`); card.style.setProperty('--my', `${y * 12}px`) }; const resetMove = () => { if (!cardRef.current) return; ['--rx', '--ry', '--mx', '--my'].forEach((name, index) => cardRef.current.style.setProperty(name, index < 2 ? '0deg' : '0px')) }; return <button ref={cardRef} className={`media-card ${project.type} tone-${project.tone}`} type="button" onClick={() => onOpen(project)} onPointerMove={handleMove} onPointerLeave={resetMove} style={{ '--delay': `${index * 90}ms` }}><div className="media-frame"><img src={project.image} alt={project.title} loading={index > 1 ? 'lazy' : 'eager'} />{project.video && <span className="play-pill"><Play size={13} fill="currentColor" /> motion</span>}<span className="card-arrow"><ArrowUpRight size={18} /></span></div><div className="card-caption"><span>{project.tag}</span><strong>{project.title}</strong></div></button> }
function VideoShowcaseCard({ project, source, index, onOpen }) {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return undefined

    const update = () => setReduceMotion(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  return <button className="video-showcase-card" type="button" onClick={() => onOpen(project)} style={{ '--delay': `${index * 100}ms` }} aria-label={`打开 ${project.title} 视频作品`}><div className="video-showcase-frame">{reduceMotion ? <img src={project.image} alt="" /> : <video autoPlay muted loop playsInline preload="metadata" poster={project.image}><source src={source} type="video/mp4" /></video>}<span className="video-showcase-meta">{project.tag}</span>{!reduceMotion && <span className="video-showcase-play"><Play size={14} fill="currentColor" /> Looping motion</span>}<span className="card-arrow"><ArrowUpRight size={18} /></span></div><div className="card-caption"><span>{project.tag}</span><strong>{project.title}</strong></div></button>
}
function LegacyWork({ onOpen }) { const videoWorks = [{ project: projects[1], source: loopSources[0] }, { project: projects[2], source: loopSources[1] }, { project: projects[4], source: loopSources[2] }]; return <section className="work section-shell" id="work-legacy"><div className="work-cover"><div className="work-cover-top"><span>02 / Selected works</span><span>Visual stories · 2023—2025</span></div><div className="work-cover-copy"><p className="eyebrow">A visual practice for things that do not exist yet</p><h2><strong>一些已经</strong><br /><em>发生的事。</em></h2><p>从舞台视觉到生成影像，<br />我在寻找画面和情绪相遇的瞬间。</p></div><div className="work-cover-main"><div className="work-cover-image"><img src={projects[0].image} alt="舞台视觉精选作品" /><span>Featured / 01</span></div><div className="work-cover-aside"><span>Selected archive</span><strong>把想象<br />变成现场。</strong><a href="#work-grid">View the archive <ArrowUpRight size={16} /></a><ProfileCard avatarUrl={`${A}5e9652ee721383880ea71b96111a1043.png`} name="Joker" title="AI Designer · Visual Storyteller" handle="jokers.space" status="Available for select projects" contactText="Start a project" onContactClick={() => { window.location.hash = 'contact' }} /></div></div><div className="work-cover-cards"><div><span>01 / IMAGE</span><strong>情绪先于形式</strong><p>让每个画面先拥有可以停留的感觉。</p></div><div><span>02 / MOTION</span><strong>光线开始说话</strong><p>用运动把观众带回现场。</p></div><div><span>03 / AI</span><strong>未知正在发生</strong><p>在算法和直觉之间保留一点意外。</p></div><div><span>04 / STORY</span><strong>留下回声</strong><p>让作品离开屏幕后继续被记住。</p></div></div></div><div className="workflow"><div className="workflow-title"><span>Creation workflow</span><strong>从概念到画面，<br />每一步都留下痕迹。</strong></div><div className="workflow-steps"><div><span>01</span><strong>Concept</strong><p>先找到真正想说的事。</p></div><div><span>02</span><strong>Storyboard</strong><p>把直觉变成可以观看的路径。</p></div><div><span>03</span><strong>Prompting</strong><p>让 AI 参与，但不替代判断。</p></div><div><span>04</span><strong>Finishing</strong><p>为每个画面留下人的温度。</p></div></div><WorkflowStackEnhancer /></div><div className="featured-heading" id="work-grid"><span>Featured motion</span><p>Three looping studies<br />from the visual archive.</p></div><div className="featured-video-grid">{videoWorks.map((item, index) => <VideoShowcaseCard key={item.project.id} {...item} index={index} onOpen={onOpen} />)}</div></section> }

function WorkVideo({ source, poster, alt }) {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return undefined
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  return <div className="work-video">{reduced ? <img src={poster} alt={alt} /> : <video autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label={alt}><source src={source} type="video/mp4" /></video>}</div>
}

function Work() {
  const videoWorks = [
    { source: loopSources[0], poster: projects[1].image, alt: 'Selected work motion study one' },
    { source: loopSources[1], poster: projects[2].image, alt: 'Selected work motion study two' },
    { source: loopSources[2], poster: projects[4].image, alt: 'Selected work motion study three' }
  ]

  return <section className="video-work-section" id="work">
    <header className="video-work-heading">
      <span className="video-work-index">02</span>
      <div>
        <span className="eyebrow">Selected works</span>
        <h2>Visual stories · 2023—2025</h2>
      </div>
    </header>
    <div className="video-work-list">
      {videoWorks.map(item => <WorkVideo key={item.source} {...item} />)}
    </div>
  </section>
}
const driftItems = [
  { image: `${A}55acda53a85daa4aff9ba4dfd30549f9.png`, title: 'Stage / light' },
  { image: `${A}3f584c457daa3b86ad9ca542df95c67d.png`, title: 'Memory / echo' },
  { image: `${A}a70df35806e90e91a3cd4f49c5f6658f.png`, title: 'Red / live' },
  { image: `${A}99bc88d85e4a2e1ee4d06444811e2101.png`, title: 'Becoming / light' },
  { image: `${A}e9ce2409ade0d77a8d3675a9df236cdf.png`, title: 'Screen / afterglow' },
  { image: `${A}5c7d48d3b72046c08ffbf76ae8abdce0.png`, title: 'Material / study' },
  { image: `${A}fd66d650b5f5d986baa9f76faaff728b.png`, title: 'Signal / 006' },
  { image: `${A}c901e44df74767d28c6f692496371b92.png`, title: 'Synthetic / body' },
  { image: `${A}d482450cfdf77f6f292e991a7cdd5cb1.png`, title: 'Human / feeling' },
  { image: `${A}035d0797e13ee670612febf4a5f01477.png`, title: 'Visual / world' },
  { image: `${A}5e9652ee721383880ea71b96111a1043.png`, title: 'Joker / portrait' }
]
function InteractionLab() { return <section className="lab" id="lab"><DriftWall items={driftItems} /><div className="lab-note"><span>INTERACTIVE STUDY / 001</span><p>Move through the wall. Hover a column to pause it and discover a fragment of the archive.</p></div></section> }
function CurvedContactPanel() { const panelRef = useRef(null); const onMove = event => { const rect = panelRef.current?.getBoundingClientRect(); if (!rect) return; const x = (event.clientX - rect.left) / rect.width - .5; const y = (event.clientY - rect.top) / rect.height - .5; panelRef.current.style.setProperty('--curve-x', `${x * 14}px`); panelRef.current.style.setProperty('--curve-y', `${y * 6}px`); panelRef.current.style.setProperty('--curve-rotate', `${x * 1.8}deg`) }; const reset = () => { if (!panelRef.current) return; panelRef.current.style.setProperty('--curve-x', '0px'); panelRef.current.style.setProperty('--curve-y', '0px'); panelRef.current.style.setProperty('--curve-rotate', '0deg') }; return <div ref={panelRef} className="curved-contact-panel" onPointerMove={onMove} onPointerLeave={reset}><div className="curved-contact-panel__glow" aria-hidden="true" /><a href="mailto:hello@jokers.space"><span><Mail size={17} /> Email</span><strong>hello@jokers.space</strong><ArrowUpRight size={18} /></a><a href="tel:+8613800000000"><span><Phone size={17} /> Phone</span><strong>+86 138 0000 0000</strong><ArrowUpRight size={18} /></a><a href="#work"><span>Project type</span><strong>Visual direction · AI design</strong><ArrowUpRight size={18} /></a></div> }
function Contact() { return <section className="contact section-shell" id="contact"><div className="contact-top"><span className="eyebrow">04 / Say hello</span><span>Available for select projects</span></div><div className="contact-main"><div className="contact-copy"><p className="eyebrow">Contact / Start something meaningful</p><h2>一起做点<br /><em>有意思的。</em></h2><p>让视觉系统、AI 创意和数字媒体项目<br />进入下一轮迭代。</p></div><div className="contact-orbit" aria-hidden="true"><span>✦</span></div></div><CurvedContactPanel /><footer><span>joker&apos;s space © 2025</span><span>Made with imagination / <a href="#top">Back to top <CircleArrowUp size={15} /></a></span></footer></section> }
function ProjectModal({ project, onClose }) { useEffect(() => { if (!project) return undefined; const onKey = event => event.key === 'Escape' && onClose(); document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey); return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) } }, [project, onClose]); if (!project) return null; return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={project.title} onClick={onClose}><div className="project-modal" onClick={event => event.stopPropagation()}><button className="modal-close" type="button" onClick={onClose} aria-label="关闭作品详情"><X size={20} /></button><div className="modal-media">{project.video ? <video autoPlay muted loop playsInline poster={project.image}><source src={project.video} type="video/mp4" /></video> : <img src={project.image} alt={project.title} />}</div><div className="modal-details"><span className="eyebrow">{project.tag}</span><h3>{project.title}</h3><p>{project.description}</p><span className="modal-foot">joker&apos;s space / visual archive</span></div></div></div> }
function App() { const [menuOpen, setMenuOpen] = useState(false); const [selectedProject, setSelectedProject] = useState(null); useEffect(() => { const onScroll = () => document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll) }, []); return <ClickSpark><main><MediaEditorEnhancer /><Hero menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><About /><Work onOpen={setSelectedProject} /><InteractionLab /><Contact /></main><ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} /></ClickSpark> }
createRoot(document.getElementById('root')).render(<App />)
