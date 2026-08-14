import { useEffect, useRef, useState } from 'react'
import './EditableMedia.css'

export default function EditableMedia({ src, alt = '', kind = 'image', accept, className = '', onChange, label = 'Replace media', onReady }) {
  const inputRef = useRef(null)
  const objectUrlRef = useRef(null)
  const inputId = useRef(`media-${Math.random().toString(36).slice(2)}`).current
  const [preview, setPreview] = useState('')
  const displaySrc = preview || src
  const resolvedAccept = accept || (kind === 'video' ? 'video/*' : 'image/*')

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
  }, [])

  const chooseFile = event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const nextUrl = URL.createObjectURL(file)
    objectUrlRef.current = nextUrl
    setPreview(nextUrl)
    onChange?.(nextUrl, file)
  }

  const stopInteraction = event => event.stopPropagation()

  return (
    <div className={`editable-media ${className}`.trim()}>
      {kind === 'video' ? <video src={displaySrc} autoPlay muted loop playsInline preload="metadata" aria-label={alt} onLoadedData={onReady} /> : <img src={displaySrc} alt={alt} draggable="false" onLoad={onReady} />}
      <span className="media-replace-button" aria-hidden="true">↗</span>
      <input
        id={inputId}
        ref={inputRef}
        className="media-replace-input"
        type="file"
        accept={resolvedAccept}
        aria-label={label}
        title={label}
        onPointerDown={stopInteraction}
        onMouseDown={stopInteraction}
        onClick={stopInteraction}
        onChange={chooseFile}
      />
    </div>
  )
}
