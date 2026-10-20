import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { pages, normalizeText } from '../content/magazine';
import { DialogShell } from './DialogShell';

export function SearchPanel({ onNavigate, onClose }: { onNavigate: (page: number, ids: string[]) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const needle = normalizeText(query.trim());
    if (needle.length < 2) return [];
    return pages.flatMap(p => {
      const matches = p.texts.filter(t => normalizeText(t.text).includes(needle));
      return matches.length ? [{ page: p, matches }] : [];
    });
  }, [query]);
  return <DialogShell title="Encontre na revista" onClose={onClose}>
    <label className="search-box"><Search size={19} /><span className="sr-only">Texto para pesquisar</span><input autoFocus type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Uma palavra, uma ideia…" /></label>
    <p className="search-summary" role="status">{query.trim().length < 2 ? 'Digite pelo menos duas letras. A busca também encontra palavras sem acentos.' : `${results.length} ${results.length === 1 ? 'página encontrada' : 'páginas encontradas'}`}</p>
    <div className="search-results">{results.map(({ page, matches }) => <button type="button" className="search-result" key={page.number} onClick={() => { onNavigate(page.number, matches.map(m => m.id)); onClose(); }}>
      <span className="result-eyebrow">PÁGINA {String(page.number).padStart(2, '0')} · {matches.length} {matches.length === 1 ? 'trecho' : 'trechos'}</span><strong>{page.title}</strong><span className="result-excerpt">{matches[0].text.length > 240 ? `${matches[0].text.slice(Math.max(0, normalizeText(matches[0].text).indexOf(normalizeText(query.trim())) - 50), Math.max(0, normalizeText(matches[0].text).indexOf(normalizeText(query.trim())) - 50) + 240)}…` : matches[0].text}</span>
    </button>)}</div>
    {query.length >= 2 && !results.length && <p className="empty-state">Nenhum trecho encontrado. Experimente outra palavra.</p>}
  </DialogShell>;
}
