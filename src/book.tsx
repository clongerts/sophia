import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';

// Artwork shown in the scrapbook pages
interface DrawingItem {
  path: string;
  title: string;
  caption: string;
}

const DRAWINGS: DrawingItem[] = [
  { path: '/drawings/drawing1.png', title: 'First Drawing', caption: 'a little piece of my heart ♡' },
  { path: '/drawings/drawing2.png', title: 'Drawing Two', caption: 'drawn with so much care ✨' },
  { path: '/drawings/drawing3.png', title: 'Drawing Three', caption: 'one of my absolute favorites ♡' },
  { path: '/drawings/drawing4.png', title: 'Drawing Four', caption: 'reminds me of your smile' },
];

export default function BirthdayScrapbook() {
  const [currentSpread, setCurrentSpread] = useState<number>(0);
  const totalSpreads = 7; // 0 = Cover, 1 = Intro, 2 = Spotlight 1, 3 = Reminders, 4 = Wishes, 5 = Letter, 6 = Final Surprise
  const [pageFlipDirection, setPageFlipDirection] = useState<'forward' | 'backward' | null>(null);
  const [turnTargetSpread, setTurnTargetSpread] = useState<number | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const pageLeafRef = useRef<HTMLDivElement | null>(null);
  const turnTimeoutRef = useRef<number | null>(null);

  const drawings = DRAWINGS;
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Envelope and Surprise states
  const [openedEnvelopes, setOpenedEnvelopes] = useState<Record<string, boolean>>({});
  const [surpriseOpened, setSurpriseOpened] = useState<boolean>(false);
  
  // Custom Letter text state
  const [letterText, setLetterText] = useState<string>(
    "Happy Birthday, my love! ♡\n\nI created this little digital scrapbook to celebrate you and save these drawings in a special place forever.\n\nEvery drawing here holds a piece of my affection for you. I hope this year brings you as much happiness as you bring into my life every single day!\n\nAlways here for you ♡"
  );

  const clearTurnStyles = (isCover: boolean) => {
    const turningElement = isCover ? coverRef.current : pageLeafRef.current;
    if (!turningElement) return;
    turningElement.style.removeProperty('transform');
    turningElement.style.removeProperty('opacity');
    turningElement.style.removeProperty('transition');
    turningElement.style.removeProperty('--turn-progress');
    turningElement.style.removeProperty('--turn-shadow');
  };

  const finishTurn = (nextSpread: number, isCover: boolean) => {
    if (turnTimeoutRef.current !== null) {
      window.clearTimeout(turnTimeoutRef.current);
      turnTimeoutRef.current = null;
    }
    clearTurnStyles(isCover);
    setCurrentSpread(nextSpread);
    setTurnTargetSpread(null);
    setPageFlipDirection(null);
  };

  const handleTurnTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform' || !pageFlipDirection) return;
    finishTurn(currentSpread + (pageFlipDirection === 'forward' ? 1 : -1), currentSpread === 0);
  };

  const turnPage = (direction: 'forward' | 'backward') => {
    if (pageFlipDirection) return;
    const nextSpread = currentSpread + (direction === 'forward' ? 1 : -1);
    if (nextSpread < 0 || nextSpread >= totalSpreads) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishTurn(nextSpread, currentSpread === 0);
      return;
    }

    if (currentSpread > 0) setTurnTargetSpread(nextSpread);
    setPageFlipDirection(direction);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const turningElement = currentSpread === 0 ? coverRef.current : pageLeafRef.current;
      if (!turningElement) return;
      turningElement.style.transition = 'transform 860ms cubic-bezier(0.42, 0, 0.2, 1), opacity 860ms ease, filter 860ms ease';
      applyPageProgress(direction);
    }));
    turnTimeoutRef.current = window.setTimeout(
      () => finishTurn(nextSpread, currentSpread === 0),
      1200
    );
  };

  const applyPageProgress = (direction: 'forward' | 'backward') => {
    const isCover = currentSpread === 0;
    const turningElement = isCover ? coverRef.current : pageLeafRef.current;
    if (!turningElement) return;

    const progress = 1;
    const angle = (isCover ? 145 : 180) * (direction === 'forward' ? -1 : 1);
    turningElement.style.transform = `rotateY(${angle}deg)`;
    turningElement.style.opacity = isCover ? `${1 - progress * 0.2}` : '1';
    turningElement.style.setProperty('--turn-progress', `${progress}`);
    turningElement.style.setProperty('--turn-shadow', `${progress * 0.22}`);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') turnPage('forward');
      if (e.key === 'ArrowLeft') turnPage('backward');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSpread, pageFlipDirection]);

  const toggleEnvelope = (id: string) => {
    setOpenedEnvelopes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getImgSrc = (drawing: DrawingItem) => {
    return drawing.path;
  };

  const visibleSpread = currentSpread === 0
    ? turnTargetSpread ?? currentSpread
    : currentSpread;

  const renderTurnPage = (spread: number, side: 'left' | 'right', interactive = false) => {
    const pageClass = 'book-turn-page-content h-full w-full overflow-hidden';

    if (spread === 1 && side === 'left') {
      return (
        <div className={`${pageClass} flex flex-col justify-between bg-[#FAF6F0] p-3 sm:p-8`}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👋</span>
              <h2 className="text-2xl font-bold text-stone-800 font-serif">hi, you! ♡</h2>
            </div>
            <div className="w-16 h-0.5 bg-rose-300" />
            <p className="text-stone-700 text-sm leading-relaxed pt-2">
              Today is all about celebrating you! I wanted to give you something tangible and heartfelt—a cozy scrapbook filled with drawings, little moments, and wishes created just for your birthday.
            </p>
            <p className="text-stone-700 text-sm leading-relaxed">
              Turn the pages to explore the artwork and open the interactive wish notes.
            </p>
          </div>
          <div className="bg-[#F2EADF] p-3 rounded-lg border border-amber-900/10 text-xs text-stone-600 italic">
            "Every drawing here holds a sweet memory."
          </div>
        </div>
      );
    }

    if (spread === 1 && side === 'right') {
      return (
        <div className={`${pageClass} relative flex flex-col items-center justify-center bg-[#F5EFE6] p-3 sm:p-8`}>
          <div
            onClick={interactive ? () => setActiveLightboxImage(getImgSrc(drawings[0])) : undefined}
            className="w-[90%] max-w-60 rotate-2 cursor-pointer border border-stone-300 bg-white p-2 pt-3 pb-6 shadow-lg transition hover:scale-105 sm:p-3"
          >
            <div className="absolute -top-3 left-1/2 h-5 w-20 -translate-x-1/2 border-x border-amber-300/40 bg-amber-200/70" />
            <div className="flex h-56 w-full items-center justify-center overflow-hidden border border-stone-200 bg-stone-50">
              <img src={getImgSrc(drawings[0])} alt={drawings[0].title} className="h-full w-full object-contain p-1" />
            </div>
            <p className="mt-3 text-center font-serif text-xs italic text-stone-700">{drawings[0].caption}</p>
          </div>
        </div>
      );
    }

    if (spread === 2) {
      const drawingIndex = side === 'left' ? 1 : 2;
      const number = side === 'left' ? 2 : 3;
      return (
        <div className={`${pageClass} flex flex-col items-center justify-between bg-[#F7F3EC] p-3 sm:p-6`}>
          <div className={`w-full ${side === 'left' ? 'text-left' : 'text-right'}`}>
            <span className="text-xs font-mono uppercase tracking-widest text-stone-400">SPOTLIGHT 0{side === 'left' ? '1' : '2'}</span>
            <h3 className="text-lg font-serif font-bold text-stone-800">{side === 'left' ? 'little pieces of art ♡' : 'drawn with care'}</h3>
          </div>
          <div
            onClick={interactive ? () => setActiveLightboxImage(getImgSrc(drawings[drawingIndex])) : undefined}
            className={`w-[90%] max-w-56 cursor-pointer border border-stone-300 bg-white p-2 shadow-md transition hover:scale-105 sm:p-3 ${side === 'left' ? '-rotate-1' : 'rotate-2'}`}
          >
            <div className="flex h-48 w-full items-center justify-center border border-stone-200 bg-stone-50">
              <img src={getImgSrc(drawings[drawingIndex])} alt={drawings[drawingIndex].title} className="h-full w-full object-contain p-1" />
            </div>
            <p className="mt-2 text-center font-serif text-xs text-stone-700">{drawings[drawingIndex].caption}</p>
          </div>
          <div className="text-xs font-mono text-stone-400">Drawing #{number} • Tap image to expand</div>
        </div>
      );
    }

    if (spread === 3 && side === 'left') {
      return (
        <div className={`${pageClass} flex flex-col justify-between bg-[#FAF4ED] p-3 sm:p-6`}>
          <div>
            <h3 className="text-xl font-bold font-serif text-stone-800">little things that remind me of you</h3>
            <p className="mt-1 text-xs italic text-stone-500">favorite moments &amp; cozy thoughts</p>
          </div>
          <div className="my-auto space-y-3">
            <div className="rotate-1 rounded border border-amber-200/80 bg-[#FFFDF9] p-3 shadow-sm">
              <p className="text-xs font-serif leading-relaxed text-stone-700">"Your smile, warm coffee mornings, quiet laughs, and endless kindness."</p>
            </div>
            <div className="-rotate-1 rounded border border-stone-300 bg-[#F0E6D8] p-3 shadow-sm">
              <p className="text-xs font-serif leading-relaxed text-stone-700">"I hope today fills your heart with all the happiness you give to others."</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-stone-400">MEMORIES ARCHIVE • BIRTHDAY SPREAD</span>
        </div>
      );
    }

    if (spread === 3 && side === 'right') {
      return (
        <div className={`${pageClass} flex flex-col items-center justify-between bg-[#FAF4ED] p-3 sm:p-6`}>
          <div
            onClick={interactive ? () => setActiveLightboxImage(getImgSrc(drawings[3])) : undefined}
            className="my-auto w-[90%] max-w-56 -rotate-2 cursor-pointer border border-stone-300 bg-white p-2 shadow-lg transition hover:scale-105 sm:p-3"
          >
            <div className="flex h-52 w-full items-center justify-center border border-stone-200 bg-stone-50">
              <img src={getImgSrc(drawings[3])} alt={drawings[3].title} className="h-full w-full object-contain p-1" />
            </div>
            <p className="mt-2 text-center font-serif text-xs text-stone-700">{drawings[3].caption}</p>
          </div>
          <span className="text-xs font-mono text-stone-400">Drawing #4</span>
        </div>
      );
    }

    if (spread === 4) {
      const wishes = [
        { id: 'env1', color: 'bg-rose-100 border-rose-300', seal: 'bg-rose-800', title: 'Wish #1', text: 'May this year bring you endless laughter & peace!' },
        { id: 'env2', color: 'bg-emerald-100 border-emerald-300', seal: 'bg-emerald-800', title: 'Wish #2', text: 'May all your creative dreams flourish beyond measure!' },
        { id: 'env3', color: 'bg-amber-100 border-amber-300', seal: 'bg-amber-800', title: 'Wish #3', text: 'Wishing you cozy moments, warmth, and good health!' },
        { id: 'env4', color: 'bg-sky-100 border-sky-300', seal: 'bg-sky-800', title: 'Wish #4', text: 'Always remember how loved and treasured you are!' },
      ];
      const pageWishes = side === 'left' ? wishes.slice(0, 2) : wishes.slice(2);
      return (
        <div className={`${pageClass} flex flex-col justify-between bg-[#FAF2EB] p-3 sm:p-6`}>
          <div className="text-center">
            <h3 className="text-xl font-serif font-bold text-stone-800">{side === 'left' ? 'A Page Full of Wishes ♡' : 'Wishes for your year ♡'}</h3>
            <p className="mt-1 text-xs text-stone-500">{side === 'left' ? 'Tap a wax seal to open your birthday wishes' : 'A few more wishes, made just for you'}</p>
          </div>
          <div className="my-auto grid grid-cols-2 gap-3">
            {pageWishes.map(env => (
              <div
                key={env.id}
                onClick={interactive ? () => toggleEnvelope(env.id) : undefined}
                className={`${env.color} relative flex min-h-[130px] cursor-pointer flex-col items-center justify-between rounded-xl border p-2 shadow-md transition hover:-translate-y-1 sm:min-h-[150px] sm:p-3`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${env.seal} text-xs font-bold text-amber-100 shadow-md`}>💌</div>
                <p className="font-serif text-xs font-bold text-stone-800">{env.title}</p>
                {openedEnvelopes[env.id] ? (
                  <div className="mt-2 rounded bg-white/90 p-2 text-center font-serif text-[11px] text-stone-700">{env.text}</div>
                ) : <span className="text-[10px] text-stone-500">Tap seal</span>}
              </div>
            ))}
          </div>
          <div className="text-center text-[10px] font-mono text-stone-400">{side === 'left' ? 'BIRTHDAY WISHES' : 'MADE WITH LOVE'}</div>
        </div>
      );
    }

    if (spread === 5) {
      if (side === 'left') {
        return (
          <div className={`${pageClass} flex flex-col justify-between bg-[#FAF5EE] p-4 sm:p-8`}>
            <span className="text-xs font-mono tracking-widest text-stone-400">A LETTER FOR YOU</span>
            <div className="space-y-4 text-center">
              <Mail className="mx-auto h-10 w-10 text-rose-400" />
              <h3 className="font-serif text-2xl font-bold text-stone-800">A Birthday Letter</h3>
              <p className="font-serif text-sm italic leading-relaxed text-stone-600">A few words from my heart, written just for you on your special day.</p>
            </div>
            <span className="text-center text-[10px] font-mono text-stone-400">ALWAYS HERE FOR YOU ♡</span>
          </div>
        );
      }
      return (
        <div className={`${pageClass} flex flex-col items-center justify-center bg-[#FAF5EE] p-3 sm:p-6`}>
          <div className="relative w-full space-y-4 rounded-xl border border-stone-300 bg-white p-3 shadow-xl sm:p-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="flex items-center gap-2 font-serif text-sm font-bold text-stone-800"><Mail className="h-5 w-5 text-rose-500" /> A Birthday Letter</span>
              <span className="text-xs font-mono text-stone-400">CONFIDENTIAL ♡</span>
            </div>
            {interactive ? (
              <textarea
                value={letterText}
                onChange={event => setLetterText(event.target.value)}
                readOnly={!interactive}
                tabIndex={interactive ? undefined : -1}
                className="h-48 w-full resize-none border-none bg-transparent font-serif text-sm leading-relaxed text-stone-800 focus:outline-none"
              />
            ) : (
              <p className="h-48 overflow-hidden whitespace-pre-wrap bg-transparent font-serif text-sm leading-relaxed text-stone-800">{letterText}</p>
            )}
            <div className="border-t border-stone-100 pt-2 text-right font-serif text-xs italic text-stone-500">Editable letter note ♡</div>
          </div>
        </div>
      );
    }

    if (spread === 6) {
      if (side === 'left') {
        return (
          <div className={`${pageClass} flex flex-col justify-between bg-[#FAF2EB] p-4 text-center sm:p-8`}>
            <span className="text-xs font-mono tracking-widest text-stone-400">ONE LAST SURPRISE</span>
            <div className="space-y-4">
              <div className="text-5xl">♡</div>
              <h3 className="font-serif text-2xl font-bold text-stone-800">the end...<br />but not really</h3>
              <p className="font-serif text-sm italic leading-relaxed text-stone-600">Thank you for being you. I hope your birthday is as wonderful as you are.</p>
            </div>
            <span className="text-[10px] font-mono text-stone-400">SCRAPBOOK COMPLETE</span>
          </div>
        );
      }
      return (
        <div className={`${pageClass} flex flex-col items-center justify-between bg-[#FAF2EB] p-3 text-center sm:p-6`}>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-800">one last surprise ♡</h3>
            <p className="mt-1 text-xs text-stone-500">a little birthday gift, just for you!</p>
          </div>
          <div
            onClick={interactive ? () => setSurpriseOpened(!surpriseOpened) : undefined}
            className="my-auto flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-rose-300 bg-white p-3 shadow-xl transition hover:scale-[1.02] sm:p-5"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl shadow-inner">{surpriseOpened ? '🎂' : '🎁'}</div>
            <p className="font-serif text-sm font-bold text-stone-800">{surpriseOpened ? 'Happy Birthday! 🎉' : 'Tap to open your final gift box ♡'}</p>
            {surpriseOpened && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/80 p-3 font-serif text-xs leading-relaxed text-stone-700">"Thank you for being you! May your day be filled with warm hugs, delicious cake, and endless smiles! Happy Birthday! 💖"</div>}
          </div>
          <div className="text-[10px] font-mono text-stone-400">CREATED WITH LOVE</div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative min-h-screen bg-[#eee5d4] text-[#4A3E3D] flex flex-col items-center justify-center font-serif select-none p-4 sm:p-8 overflow-hidden">
      
      {/* MAIN SCRAPBOOK CONTAINER (3D BOOK SPREAD) */}
      <main
        className={`relative flex items-center justify-center perspective-[1800px] ${visibleSpread === 0 ? 'book-cover-stage my-auto' : 'book-open-stage my-auto'}`}
        aria-label="Interactive birthday scrapbook"
      >
        
        {/* SCRAPBOOK SPREAD FRAME */}
        <div
          className={`relative flex h-full w-full flex-col overflow-hidden bg-[#FAF6F0] ${visibleSpread === 0 ? 'book-cover-shell' : 'book-open-shell'}`}
          ref={visibleSpread === 0 ? coverRef : null}
          onTransitionEnd={currentSpread === 0 ? handleTurnTransitionEnd : undefined}
        >
          
          {currentSpread > 0 && turnTargetSpread !== null && pageFlipDirection && (
            <div
              className={`book-page-preview book-page-preview-${pageFlipDirection}`}
              aria-hidden="true"
            >
              {renderTurnPage(
                turnTargetSpread,
                pageFlipDirection === 'forward' ? 'right' : 'left'
              )}
            </div>
          )}
          {visibleSpread > 0 && pageFlipDirection && (
            <div
              className={`book-page-leaf book-page-leaf-${pageFlipDirection}`}
              ref={pageLeafRef}
              aria-hidden="true"
              onTransitionEnd={handleTurnTransitionEnd}
            >
              <div className="book-page-leaf-face book-page-leaf-front">
                {renderTurnPage(currentSpread, pageFlipDirection === 'forward' ? 'right' : 'left')}
              </div>
              <div className="book-page-leaf-face book-page-leaf-back">
                {renderTurnPage(turnTargetSpread ?? visibleSpread, pageFlipDirection === 'forward' ? 'left' : 'right')}
              </div>
            </div>
          )}

          {/* ================= SPREAD 0: COVER SPREAD ================= */}
          {visibleSpread === 0 && (
            <section className="book-closed-cover relative flex h-full w-full flex-col items-center justify-center text-center">
              <span className="book-cover-emblem" aria-hidden="true">🎂︎</span>
              <h1 className="book-cover-title">Happy Birthday<br />Sophia!!!</h1>
              <span className="book-cover-rule" aria-hidden="true" />
              <p className="book-cover-subtitle">a little gift from me to you</p>
              <span className="book-cover-flower" aria-hidden="true">✿</span>
              <span className="book-cover-hint" aria-hidden="true">open here</span>
              <span className="book-cover-spine" aria-hidden="true" />
              <span className="book-cover-frame" aria-hidden="true" />
              <button
                type="button"
                onClick={() => turnPage('forward')}
                disabled={Boolean(pageFlipDirection)}
                className="book-cover-open-area"
                aria-label="Open the book"
              />
              <button
                type="button"
                className="page-turn-zone page-turn-zone-right"
                onClick={() => turnPage('forward')}
                aria-label="Open the book"
              />
            </section>
          )}

          {/* ================= SPREAD 1: INTRODUCTION ================= */}
          {visibleSpread === 1 && (
            <div className="flex h-full w-full">
              <div className="h-full w-1/2">{renderTurnPage(1, 'left', true)}</div>
              <div className="h-full w-1/2">{renderTurnPage(1, 'right', true)}</div>
            </div>
          )}

          {/* ================= SPREAD 2: ARTWORK SPOTLIGHT 1 ================= */}
          {visibleSpread === 2 && (
            <div className="flex h-full w-full">
              <div className="h-full w-1/2">{renderTurnPage(2, 'left', true)}</div>
              <div className="h-full w-1/2">{renderTurnPage(2, 'right', true)}</div>
            </div>
          )}

          {/* ================= SPREAD 3: REMINDERS & MEMORIES ================= */}
          {visibleSpread === 3 && (
            <div className="flex h-full w-full">
              <div className="h-full w-1/2">{renderTurnPage(3, 'left', true)}</div>
              <div className="h-full w-1/2">{renderTurnPage(3, 'right', true)}</div>
            </div>
          )}

          {/* ================= SPREAD 4: A PAGE FULL OF WISHES ================= */}
          {visibleSpread === 4 && (
            <div className="flex h-full w-full">
              <div className="h-full w-1/2">{renderTurnPage(4, 'left', true)}</div>
              <div className="h-full w-1/2">{renderTurnPage(4, 'right', true)}</div>
            </div>
          )}

          {/* ================= SPREAD 5: A LITTLE BIRTHDAY LETTER ================= */}
          {visibleSpread === 5 && (
            <div className="flex h-full w-full">
              <div className="h-full w-1/2">{renderTurnPage(5, 'left')}</div>
              <div className="h-full w-1/2">{renderTurnPage(5, 'right', true)}</div>
            </div>
          )}

          {/* ================= SPREAD 6: ONE LAST LITTLE SURPRISE ================= */}
          {visibleSpread === 6 && (
            <div className="flex h-full w-full">
              <div className="h-full w-1/2">{renderTurnPage(6, 'left')}</div>
              <div className="h-full w-1/2">{renderTurnPage(6, 'right', true)}</div>
            </div>
          )}

          {visibleSpread > 0 && (
            <>
              <button
                type="button"
                className="page-turn-zone page-turn-zone-left"
                onClick={() => turnPage('backward')}
                disabled={Boolean(pageFlipDirection) || currentSpread === 0}
                aria-label="Turn to the previous spread"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="page-turn-zone page-turn-zone-right"
                onClick={() => turnPage('forward')}
                disabled={Boolean(pageFlipDirection) || currentSpread === totalSpreads - 1}
                aria-label="Turn to the next spread"
              >
                <ChevronRight aria-hidden="true" />
              </button>
              <span className="book-page-count" aria-live="polite">
                {currentSpread} / {totalSpreads - 1}
              </span>
            </>
          )}

        </div>
      </main>

      {/* LIGHTBOX ARTWORK INSPECTION MODAL */}
      {activeLightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-3xl max-h-[90vh] bg-[#FAF6F0] p-4 rounded-2xl border border-stone-300 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shadow-lg hover:bg-rose-700 transition"
            >
              ✕
            </button>
            <img 
              src={activeLightboxImage} 
              alt="Expanded Drawing" 
              className="max-h-[75vh] w-auto object-contain rounded border border-stone-200" 
            />
            <p className="text-stone-600 font-serif text-xs mt-3">High-resolution drawing inspection view</p>
          </div>
        </div>
      )}

    </div>
  );
}