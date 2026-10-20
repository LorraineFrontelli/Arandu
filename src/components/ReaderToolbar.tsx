import { Bookmark, Grid2X2, Maximize, Search, Share2, ZoomIn, Minimize, BookOpen, BookX } from 'lucide-react';
import { IconButton } from './IconButton';
import { PageNavigation } from './PageNavigation';

export function ReaderToolbar({ page, total, title, previous, next, go, onIndex, onSearch, onZoom, onShare, onFullscreen, fullscreen, bookmarked, onBookmark }: { page: number; total: number; title: string; previous: () => void; next: () => void; go: (n: number) => void; onIndex: () => void; onSearch: () => void; onZoom: () => void; onShare: () => void; onFullscreen: () => void; fullscreen: boolean; bookmarked: boolean; onBookmark: () => void }) {
  return <footer className="reader-toolbar">
    <div className="toolbar-section toolbar-tools">
      <IconButton label="Fechar revista e voltar à capa" onClick={() => go(1)} disabled={page === 1}><BookX size={19} /></IconButton>
      <IconButton label="Ver todas as páginas" onClick={onIndex}><Grid2X2 size={19} /></IconButton>
      <IconButton label="Pesquisar na revista" onClick={onSearch}><Search size={19} /></IconButton>
      <IconButton label={bookmarked ? 'Remover marcador desta página' : 'Marcar esta página'} onClick={onBookmark} aria-pressed={bookmarked}><Bookmark size={19} fill={bookmarked ? 'currentColor' : 'none'} /></IconButton>
    </div>
    <PageNavigation page={page} total={total} previous={previous} next={next} go={go} />
    <div className="toolbar-section toolbar-actions">
      <span className="current-section"><BookOpen size={13} />{title}</span>
      <IconButton label="Ampliar página" onClick={onZoom}><ZoomIn size={19} /></IconButton>
      <IconButton label="Copiar link desta página" onClick={onShare}><Share2 size={18} /></IconButton>
      <IconButton label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'} onClick={onFullscreen}>{fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}</IconButton>
    </div>
  </footer>;
}
