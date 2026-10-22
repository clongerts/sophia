# Our Little Book of You

The root page (`/`) is the recipient-facing personal scrapbook. It starts with a blank page; turn it from the right edge to reveal the brown cover, then open the cover to find the note and scrapbook pages. There is no developer page or in-app editor.

## Run locally

1. Install Node.js.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

Run `npm run build` to create a production build in `dist/`.
Run `npm run typecheck` to check the TypeScript sources.

Add artwork files named `drawing1.png` through `drawing4.png` to `public/drawings/`; the scrapbook displays them in its Polaroid frames. The captions and page text can be edited in `src/book.tsx`.
