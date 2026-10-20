import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, BookOpen, LoaderCircle } from 'lucide-react';
import { pages, loadArtwork, preloadArtworkImages } from './content/magazine';
import type { ZoomTarget } from './types/magazine';
import { useReaderNavigation } from './hooks/useReaderNavigation';
import { readLocal, writeLocal } from './utils/storage';
import { IconButton } from './components/IconButton';
import { PageTurner } from './components/PageTurner';
import { ReaderToolbar } from './components/ReaderToolbar';
import { PageIndex } from './components/PageIndex';
import { SearchPanel } from './components/SearchPanel';
import { ZoomDialog } from './components/ZoomDialog';
import { ReferenceDialog } from './components/ReferenceDialog';
import { spreadLabel, visiblePages } from './utils/bookGeometry';
import { prepareLatest } from './utils/prepareLatest';

export default function App() {
  const navigation = useReaderNavigation(pages.length);
  const { page, resumePage, go, previous, next } = navigation;
  const requestedReadingPage = useRef(page);
  requestedReadingPage.current = page;
  const [artwork, setArtwork] = useState<string[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState<'index' | 'search' | null>(null);
  const [zoom, setZoom] = useState<ZoomTarget | null>(null);
  const [highlight, setHighlight] = useState<{ page: number; ids: string[] } | null>(null);
  const [controls, setControls] = useState(() => readLocal('controls', true));
  const [bookmarks, setBookmarks] = useState<number[]>(() => readLocal('bookmarks', []));
  const [fullscreen, setFullscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let alive = true;
    loadArtwork(done => alive && setProgress(done), page).then(async value => {
      // A shared link can change to the cover while fonts/images are loading.
      // Never reveal that new face using readiness from the old selection.
      await prepareLatest(() => requestedReadingPage.current, selected => Promise.all(visiblePages(selected).map(number => preloadArtworkImages(value[number - 1]))));
      if (alive) setArtwork(value);
    }).catch(cause => alive && setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a revista.'));
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(query.matches);
    const full = () => setFullscreen(Boolean(document.fullscreenElement));
    query.addEventListener('change', change); document.addEventListener('fullscreenchange', full);
    return () => { query.removeEventListener('change', change); document.removeEventListener('fullscreenchange', full); };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setHighlight(null), 9000);
    return () => clearTimeout(timer);
  }, [highlight]);
  const announce = useCallback((message: string) => { setToast(message); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3500); }, []);
  const openZoom = useCallback((target: ZoomTarget) => setZoom(target), []);
  const closeZoom = useCallback(() => setZoom(null), []);
  const openWholePage = useCallback(() => setZoom({ page: pages[page - 1], box: { x: 0, y: 0, width: 1440, height: 1024 }, label: pages[page - 1].title, kind: 'page' }), [page]);
  const toggleBookmark = useCallback(() => setBookmarks(old => { const marked = old.includes(page); const updated = marked ? old.filter(p => p !== page) : [...old, page]; writeLocal('bookmarks', updated); announce(marked ? 'Marcador removido' : 'Página guardada nos marcadores'); return updated; }), [page, announce]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (!artwork || panel || zoom || (event.target as HTMLElement).closest('input, select, textarea, [contenteditable="true"]')) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
      if (event.key === 'Home') { event.preventDefault(); go(1); }
      if (event.key === 'End') { event.preventDefault(); go(pages.length); }
      if (event.key.toLowerCase() === 's' && !event.ctrlKey && !event.metaKey) setPanel('search');
      if (event.key.toLowerCase() === 'z' && !event.ctrlKey && !event.metaKey) openWholePage();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [artwork, panel, zoom, next, previous, go, openWholePage]);
  const share = async () => {
    try { await navigator.clipboard.writeText(location.href); announce('Link desta página copiado'); }
    catch { announce(`Link da página: ${location.href}`); }
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else announce('Neste navegador, use a opção de tela cheia do próprio dispositivo.');
    } catch { announce('A tela cheia não está disponível neste navegador.'); }
  };
  return <main className={`reader-app ${controls ? '' : 'quiet-mode'}`}>
    <a className="skip-link" href="#reader-controls" onClick={event => { event.preventDefault(); setControls(true); writeLocal('controls', true); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('#reader-controls button:not(:disabled)')?.focus()); }}>Ir para os controles de leitura</a>
    <header className="reader-header"><button className="brand" onClick={() => go(1)} aria-label="Arandu — voltar à capa"><span className="brand-word">Arandu</span><span className="brand-subtitle">DIREITO À CULTURA</span></button><div className="edition-label">EDIÇÃO 001 <span>·</span> OUTUBRO 2026</div><div className="header-tools"><span className="reading-hint"><ArrowUpRight size={13} /> Uma revista para explorar</span><IconButton label={controls ? 'Ocultar controles de leitura' : 'Mostrar controles de leitura'} onClick={() => setControls(old => { writeLocal('controls', !old); return !old; })}>{controls ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton></div></header>
    {!artwork ? <div className="loading-screen" role="status">{error ? <><BookOpen size={36} /><h1>A revista não carregou</h1><p>{error}</p><button className="primary-button" onClick={() => location.reload()}>Tentar novamente</button></> : <><span className="loading-brand">Arandu</span><LoaderCircle className="spinner" size={25} /><p>Preparando sua leitura</p><progress value={progress} max={pages.length} aria-label="Páginas carregadas" /><small>{progress} de {pages.length} páginas</small></>}</div> : <PageTurner page={page} resumePage={resumePage} artwork={artwork} onNavigate={go} onZoom={openZoom} highlight={highlight} reducedMotion={reducedMotion} />}
    <div id="reader-controls" inert={!artwork} aria-busy={!artwork} className={controls ? '' : 'hidden-controls'}><ReaderToolbar page={page} total={pages.length} title={pages[page - 1].title} previous={previous} next={next} go={go} onIndex={() => setPanel('index')} onSearch={() => setPanel('search')} onZoom={openWholePage} onShare={share} onFullscreen={toggleFullscreen} fullscreen={fullscreen} bookmarked={bookmarks.includes(page)} onBookmark={toggleBookmark} /></div>
    <p className="reader-instructions" aria-hidden="true">Leia à esquerda → siga à direita → vire a folha.</p>
    <span className="sr-only" aria-live="polite">{page === 1 ? 'Revista fechada, capa' : page === pages.length ? 'Contracapa' : `Páginas ${spreadLabel(page)} abertas`}. Página selecionada {page} de {pages.length}: {pages[page - 1].title}</span>
    {toast && <div className="toast" role="status">{toast}</div>}
    {panel === 'index' && <PageIndex current={page} bookmarked={bookmarks} onNavigate={go} onClose={() => setPanel(null)} />}
    {panel === 'search' && <SearchPanel onClose={() => setPanel(null)} onNavigate={(number, ids) => { go(number); setHighlight({ page: number, ids }); }} />}
    {zoom && artwork && (zoom.kind === 'reference' ? <ReferenceDialog target={zoom} onClose={closeZoom} /> : <ZoomDialog target={zoom} svg={artwork[zoom.page.number - 1]} onClose={closeZoom} />)}
  </main>;
}
