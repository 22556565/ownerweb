# joker's space

An interactive visual portfolio for an AI designer and visual storyteller.

The site combines local image and video studies with lightweight React interactions: a full-screen motion hero, draggable lanyard card, tilt cards, depth carousel, stacked workflow, selected-work video sequence, drifting image wall, and contact interactions.

## Tech stack

- React
- Vite
- Plain CSS
- Lucide React icons

No additional runtime services or external media assets are required. Visual assets are served from the local `public/assets` directory.

## Getting started

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
npm run preview
```

## Project structure

- `src/main.jsx` — page composition and section content
- `src/styles.css` — global layout and visual system
- `src/components/` — reusable interaction components
- `public/assets/` — local image and video assets

## Local media replacement

The small replace button in the top-right corner of media blocks opens the browser's native file picker. A selected image or video is previewed in memory for the current page session; it is not uploaded and does not overwrite the original project asset. Refreshing the page restores the default media.

## Motion and accessibility

Interactive effects use browser-native pointer and animation APIs. Components include reduced-motion fallbacks for users who prefer less animation.
