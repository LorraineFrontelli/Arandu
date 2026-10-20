import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './IconButton';

export function PageNavigation({ page, total, previous, next, go }: { page: number; total: number; previous: () => void; next: () => void; go: (n: number) => void }) {
  return <nav className="page-navigation" aria-label="Navegação da revista">
    <IconButton label="Página anterior" onClick={previous} disabled={page === 1}><ChevronLeft size={20} /></IconButton>
    <span className="spread-indicator" aria-label={`Página atual: ${page} de ${total}`}>{String(page).padStart(2, '0')} <span>/ {total}</span></span>
    <label className="page-input"><span className="page-input-prefix" aria-hidden="true">IR À</span><select aria-label="Ir para a página" value={page} onChange={event => go(Number(event.target.value))}>{Array.from({ length: total }, (_, i) => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}</select></label>
    <IconButton label="Próxima página" onClick={next} disabled={page === total}><ChevronRight size={20} /></IconButton>
  </nav>;
}
