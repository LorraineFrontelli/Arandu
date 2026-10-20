import { Bookmark } from 'lucide-react';
import { useState } from 'react';
import { pages, assetUrl } from '../content/magazine';
import { DialogShell } from './DialogShell';

export function PageIndex({ current, bookmarked, onNavigate, onClose }: { current: number; bookmarked: number[]; onNavigate: (page: number) => void; onClose: () => void }) {
  const [onlyMarked, setOnlyMarked] = useState(false);
  const shown = onlyMarked ? pages.filter(p => bookmarked.includes(p.number)) : pages;
  return <DialogShell title="Explore a revista" onClose={onClose}>
    <div className="panel-intro"><p>20 páginas. Muitos caminhos para ler.</p><button type="button" className="text-button" aria-pressed={onlyMarked} onClick={() => setOnlyMarked(!onlyMarked)}><Bookmark size={14} />{onlyMarked ? 'Mostrar todas' : 'Meus marcadores'}</button></div>
    <div className="page-grid">{shown.map(p => <button type="button" key={p.number} className={`page-card ${p.number === current ? 'is-current' : ''}`} aria-current={p.number === current ? 'page' : undefined} onClick={() => { onNavigate(p.number); onClose(); }}>
      <div className="thumbnail-wrap"><img src={assetUrl(p.thumbnail)} alt="" loading="lazy" />{bookmarked.includes(p.number) && <Bookmark size={17} className="thumbnail-bookmark" fill="currentColor" />}</div>
      <span className="page-card-label"><span>{String(p.number).padStart(2, '0')}</span>{p.title}</span>
    </button>)}</div>
    {onlyMarked && !shown.length && <p className="empty-state">Use o marcador na barra de leitura para guardar suas páginas.</p>}
  </DialogShell>;
}
