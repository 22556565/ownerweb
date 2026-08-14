# joker's space

An interactive visual portfolio for an AI designer and visual storyteller.

- Live site: [temporary-quick-kazoo-ry3bdzx.vercel.app](https://temporary-quick-kazoo-ry3bdzx.vercel.app/)
- GitHub repository: [22556565/ownerweb](https://github.com/22556565/ownerweb)

## About

The site combines local image and video studies with lightweight React interactions:

- Full-screen motion hero with particle typography
- Draggable lanyard identity card
- Pointer-reactive tilt cards
- Depth carousel for the visual practice section
- Scroll-stacked creation workflow
- Vertical selected-work video sequence
- Full-width drifting image wall
- Interactive contact panel
- Reduced-motion fallbacks for accessibility

All visual assets used by the page are stored locally in `public/assets`.

## Tech stack

- React
- Vite
- Plain CSS
- Lucide React icons

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

## Deployment

The project is configured as a standard Vite application for Vercel:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Production branch: `main`

To deploy with the Vercel CLI:

```bash
npm install --global vercel
vercel login
vercel --prod
```

## Project structure

- `src/main.jsx` — page composition and section content
- `src/styles.css` — global layout and visual system
- `src/components/` — reusable interaction components
- `public/assets/` — local image and video assets

## Local media replacement

The small replace control in the top-right corner of media blocks opens the browser's native file picker. A selected image or video is previewed in memory for the current page session.

The selected file is not uploaded and does not overwrite the original project asset. Refreshing the page restores the default media.

## Motion and accessibility

Interactive effects use browser-native pointer and animation APIs. Components include `prefers-reduced-motion` fallbacks for users who prefer less animation.
