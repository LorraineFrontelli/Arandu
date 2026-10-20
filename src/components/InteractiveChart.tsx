import { useState } from 'react';
import type { Hotspot } from '../types/magazine';

export function InteractiveChart({ details, onHighlight }: { details: Hotspot['details']; onHighlight: (id: string | null) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  if (!details?.length) return null;
  return <aside className="chart-details" aria-label="Textos e valores originais do gráfico"><h3>Olhe de perto</h3><p>Toque em um trecho para destacá-lo. Os valores são os do original.</p><div>{details.map(detail => <button type="button" key={detail.id} className={selected === detail.id ? 'is-selected' : ''} aria-pressed={selected === detail.id} onMouseEnter={() => onHighlight(detail.id)} onMouseLeave={() => onHighlight(selected)} onFocus={() => onHighlight(detail.id)} onBlur={() => onHighlight(selected)} onClick={() => { const next = selected === detail.id ? null : detail.id; setSelected(next); onHighlight(next); }}>{detail.text}</button>)}</div></aside>;
}
