import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, MoveHorizontal, RotateCcw } from 'lucide-react';
import { PageFlip } from 'page-flip';
import { assetUrl, pages, preloadArtworkImages } from '../content/magazine';
import type { ZoomTarget } from '../types/magazine';
import { cameraShift, leafForPage, nextReadingPage, PAGE_HEIGHT, PAGE_WIDTH, previousReadingPage, spreadLabel, spreadStart, visiblePages } from '../utils/bookGeometry';
import { MagazinePage } from './MagazinePage';
import { BookVolume } from './BookVolume';
import { CoverTurnover } from './CoverTurnover';
import { useBookGestures } from '../hooks/useBookGestures';

interface Props {
  page: number;
  resumePage: number;
  artwork: string[];
  onNavigate: (page: number) => void;
  onZoom: (target: ZoomTarget) => void;
  highlight: { page: number; ids: string[] } | null;
  reducedMotion: boolean;
}

export function PageTurner({ page, resumePage, artwork, onNavigate, onZoom, highlight, reducedMotion }: Props) {
  const area = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const engine = useRef<PageFlip | null>(null);
  const requestedPage = useRef<number | null>(null);
  const performJump = useRef<() => void>(() => {});
  const loadingTarget = useRef<number | null>(null);
  const motion = useRef(reducedMotion);
  motion.current = reducedMotion;
  const currentPage = useRef(page);
  currentPage.current = page;
  const navigate = useRef(onNavigate);
  navigate.current = onNavigate;
  const [size, setSize] = useState({ width: 0, height: 0, closedScale: 1 });
  const [turning, setTurning] = useState(false);
  const [cameraMoving, setCameraMoving] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [focusedPage, setFocusedPage] = useState(page);
  const focusedRef = useRef(focusedPage);
  focusedRef.current = focusedPage;
  const [preparing, setPreparing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [returningCover, setReturningCover] = useState(false);
  const returning = useRef(false);
  const turnoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leafTarget = useRef<number | null>(null);
  useBookGestures(engine, focusedRef, navigate, leafTarget, mount);
  const ready = size.width > 0;
  const [loaded, setLoaded] = useState(() => new Set(pages.filter(p => Math.abs(p.number - page) <= 3).map(p => p.number)));
  const start = spreadStart(focusedPage);
  const closed = start === 1 || start === pages.length;
  const leaves = useMemo(() => pages.map(p => {
    const leaf = document.createElement('div');
    const physical = leafForPage(p.number);
    leaf.className = 'magazine-leaf';
    leaf.dataset.density = p.number === 1 || p.number === pages.length ? 'hard' : 'soft';
    leaf.dataset.leaf = String(physical.leaf);
    leaf.dataset.face = physical.face;
    leaf.dataset.pageNumber = String(p.number);
    return leaf;
  }), []);

  useEffect(() => {
    const nearby = pages.filter(p => Math.abs(p.number - page) <= 3);
    setLoaded(old => { const next = new Set(old); nearby.forEach(p => next.add(p.number)); return next.size === old.size ? old : next; });
    nearby.forEach(p => { void preloadArtworkImages(artwork[p.number - 1]).catch(() => {}); });
  }, [page, artwork]);

  useEffect(() => {
    const element = area.current!;
    let timer: ReturnType<typeof setTimeout>;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      // Fit ONE complete face, not a miniature spread. The two-sided book stays
      // intact; its camera moves from the left face to the right face.
      const margin = rect.width < 600 ? 32 : 140;
      const scale = Math.min((rect.width - margin) / PAGE_WIDTH, Math.max(65, rect.height - 110) / PAGE_HEIGHT);
      const width = Math.max(80, Math.floor(PAGE_WIDTH * scale));
      const height = width * PAGE_HEIGHT / PAGE_WIDTH;
      const closedScale = Math.max(.4, Math.min(1, (rect.height - 160) / (height * 1.08), (rect.width - 66) / (width * 1.1)));
      setResizing(true);
      setSize({ width, height, closedScale });
      requestAnimationFrame(() => setResizing(false));
    };
    const observer = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(measure, 100); });
    observer.observe(element); measure();
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!ready || !mount.current) return;
    const host = document.createElement('div');
    host.className = 'flip-engine';
    host.style.width = `${size.width * 2}px`; host.style.height = `${size.height}px`;
    mount.current.replaceChildren(host);
    leaves.forEach(leaf => { leaf.style.cssText = ''; leaf.className = 'magazine-leaf'; });
    const flip = new PageFlip(host, {
      width: size.width, height: size.height, size: 'fixed', startPage: currentPage.current - 1,
      drawShadow: !reducedMotion, flippingTime: reducedMotion ? 1 : 1100,
      usePortrait: false, autoSize: false, maxShadowOpacity: .33,
      showCover: true, mobileScrollSupport: true, clickEventForward: true,
      useMouseEvents: false, swipeDistance: 28, showPageCorners: false, disableFlipByClick: false,
    });
    engine.current = flip;
    let initializing = true;
    const focusPage = (selected: number) => {
      const previous = focusedRef.current;
      const wasClosed = previous === 1 || previous === pages.length;
      const willClose = selected === 1 || selected === pages.length;
      if (!motion.current && (cameraShift(previous, 1) !== cameraShift(selected, 1) || wasClosed !== willClose)) setCameraMoving(true);
      setFocusedPage(selected);
    };
    const setAccessiblePage = (selected: number) => {
      leaves.forEach((leaf, i) => {
        leaf.inert = i + 1 !== selected;
        leaf.setAttribute('aria-hidden', String(i + 1 !== selected));
      });
    };
    requestedPage.current = null;
    performJump.current = () => {
      const target = requestedPage.current;
      if (target === null || returning.current || flip.getState() !== 'read') return;
      if (spreadStart(flip.getCurrentPageIndex() + 1) === spreadStart(target + 1)) {
        requestedPage.current = null;
        setAccessiblePage(target + 1);
        focusPage(target + 1);
        return;
      }
      if (loadingTarget.current === target) return;
      loadingTarget.current = target;
      setPreparing(true);
      setLoadError('');
      const targetFaces = visiblePages(target + 1);
      // Decode BOTH faces of the destination before revealing a spread.
      void Promise.all(targetFaces.map(number => preloadArtworkImages(artwork[number - 1]))).then(() => {
        loadingTarget.current = null;
        if (engine.current !== flip) return;
        setPreparing(false);
        if (requestedPage.current !== target) { performJump.current(); return; }
        if (flip.getState() !== 'read') return;
        if (flip.getCurrentPageIndex() === pages.length - 1 && target === 0 && !motion.current) {
          returning.current = true;
          setReturningCover(true);
          // Hide the engine under a double-sided closed magazine and turn the
          // whole object over. Do not rewind its inner leaves from the end.
          flip.turnToPage(0);
          turnoverTimer.current = setTimeout(() => {
            returning.current = false;
            setReturningCover(false);
            performJump.current();
          }, 1350);
          return;
        }
        if (motion.current) flip.turnToPage(target);
        else flip.flip(target, 'top');
      }).catch(() => {
        loadingTarget.current = null;
        if (engine.current !== flip) return;
        setPreparing(false);
        setLoadError('Uma imagem não carregou. A página anterior foi mantida.');
      });
    };
    flip.on('flip', event => {
      // render.start() emits an orientation update at page 0 before applying
      // startPage. That internal event must never overwrite a shared hash.
      if (initializing) { setAccessiblePage(currentPage.current); return; }
      const target = requestedPage.current;
      const selected = target !== null && spreadStart(target + 1) === spreadStart(event.data + 1) ? target + 1
        : leafTarget.current !== null && spreadStart(leafTarget.current) === spreadStart(event.data + 1) ? leafTarget.current
        : spreadStart(currentPage.current) === spreadStart(event.data + 1) ? currentPage.current : event.data + 1;
      focusPage(selected);
      setAccessiblePage(selected);
      if (target !== null) {
        if (spreadStart(target + 1) === spreadStart(event.data + 1)) requestedPage.current = null;
        // Keep a specific right-hand face in the hash (e.g. #pagina=13).
      } else if (currentPage.current !== selected) {
        navigate.current(selected);
      }
    });
    flip.on('changeState', event => {
      setTurning(event.data !== 'read');
      if (event.data === 'read') { leafTarget.current = null; requestAnimationFrame(() => engine.current === flip && performJump.current()); }
    });
    flip.loadFromHTML(leaves);
    initializing = false;
    setAccessiblePage(currentPage.current);
    return () => { engine.current = null; performJump.current = () => {}; if (turnoverTimer.current) clearTimeout(turnoverTimer.current); flip.destroy(); };
    // StPageFlip 2.x leaves its RAF loop running after destroy. Resize this one
    // engine in place, so stale renderers cannot overwrite the same HTML faces.
  }, [ready, leaves]);

  useLayoutEffect(() => {
    const flip = engine.current;
    const host = mount.current?.querySelector<HTMLElement>('.flip-engine');
    if (!flip || !host) return;
    flip.getRender().finishAnimation();
    const settings = flip.getSettings();
    settings.width = settings.minWidth = settings.maxWidth = size.width;
    settings.height = settings.minHeight = settings.maxHeight = size.height;
    settings.flippingTime = reducedMotion ? 1 : 1100;
    settings.drawShadow = !reducedMotion;
    host.style.width = host.style.minWidth = `${size.width * 2}px`;
    host.style.height = host.style.minHeight = `${size.height}px`;
    flip.update();
    performJump.current();
  }, [size.width, size.height, reducedMotion]);

  useEffect(() => {
    const flip = engine.current;
    if (!flip) return;
    requestedPage.current = page - 1;
    performJump.current();
  }, [page, reducedMotion]);

  const editorialNavigate = (target: number, label = '') => {
    if (label.includes('PRÓXIMA')) onNavigate(nextReadingPage(currentPage.current));
    else if (label.includes('ANTERIOR')) onNavigate(previousReadingPage(currentPage.current));
    else onNavigate(target);
  };
  const style = {
    width: size.width * 2 || 220, height: size.height || 78,
    '--page-width': `${size.width}px`, '--closed-scale': size.closedScale,
    '--book-shift': `${cameraShift(focusedPage, size.width)}px`,
  } as CSSProperties;

  return <section className={`reading-area desk-scene ${closed ? 'scene-closed' : 'scene-open'} ${turning ? 'is-turning' : ''} ${preparing ? 'is-preparing' : ''} ${resizing ? 'is-resizing' : ''} ${returningCover ? 'is-turning-over' : ''}`} ref={area} aria-label="Revista tridimensional sobre uma mesa, vista de cima" aria-busy={turning || preparing || returningCover || cameraMoving} data-camera-moving={cameraMoving} data-spread={spreadLabel(focusedPage)} data-reading-page={focusedPage} style={{ '--desk-texture': `url("${assetUrl('assets/scene/oak-table.svg')}")` } as CSSProperties}>
    <div className="desk-light" aria-hidden="true" />
    <div className={`book-position ${closed ? 'book-closed' : 'book-open'} ${start === pages.length ? 'back-cover' : ''}`} style={style} onTransitionRun={event => { if (event.target === event.currentTarget && event.propertyName === 'transform') setCameraMoving(true); }} onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === 'transform') setCameraMoving(false); }} onTransitionCancel={event => { if (event.target === event.currentTarget && event.propertyName === 'transform') setCameraMoving(false); }}>
      <div className="book-contact-shadow" aria-hidden="true" />
      <BookVolume page={focusedPage} />
      <div ref={mount} className="book-mount" />
      {closed && <button className="cover-open-button" aria-label={start === 1 ? 'Abrir revista pela capa' : 'Reabrir revista pela contracapa'} onClick={() => onNavigate(start === 1 ? 2 : 19)} disabled={turning || preparing}><span className="sr-only">Clique ou pressione Enter para abrir</span></button>}
      {!closed && <div className="spine-light" aria-hidden="true" />}
    </div>
    {returningCover && <CoverTurnover front={artwork[0]} back={artwork[19]} width={size.width} height={size.height} scale={size.closedScale} onComplete={() => { returning.current = false; setReturningCover(false); if (turnoverTimer.current) clearTimeout(turnoverTimer.current); performJump.current(); }} />}
    <div className="desk-caption">
      {closed ? <>
        <button className="open-invitation" onClick={() => onNavigate(start === 1 ? 2 : 1)} disabled={turning || preparing || returningCover}><BookOpen size={17} /><span>{start === 1 ? 'Clique na capa para abrir' : 'Voltar à capa'}</span><span className="invitation-arrow">↗</span></button>
        {start === 1 && resumePage > 1 && resumePage < pages.length ? <button className="resume-reading" onClick={() => onNavigate(resumePage)}><RotateCcw size={12} /> Continuar na página {String(resumePage).padStart(2, '0')}</button> : <span className="desk-caption-detail">20 páginas · 10 folhas com frente e verso</span>}
      </> : <>
        <span className="reading-side-label">{String(focusedPage).padStart(2, '0')} <span>·</span> {focusedPage % 2 === 0 ? 'esquerda' : 'direita'}</span>
        <span className="desk-caption-detail"><MoveHorizontal size={13} /> {focusedPage % 2 === 0 ? 'Próxima: ler a página da direita' : 'Próxima: virar a folha'}</span>
      </>}
    </div>
    {loadError && <div className="artwork-error" role="alert">{loadError}<button onClick={() => performJump.current()}>Tentar novamente</button></div>}
    {leaves.map((leaf, index) => createPortal(loaded.has(index + 1) || Math.abs(index + 1 - page) <= 3 ? <MagazinePage page={pages[index]} svg={artwork[index]} onNavigate={editorialNavigate} onZoom={onZoom} highlighted={highlight?.page === index + 1 ? highlight.ids : []} /> : null, leaf, String(index)))}
  </section>;
}
