import { useEffect, useId, useMemo, useState } from 'react';
import { Minus, Plus, Scan, List } from 'lucide-react';
import { scopeSvg } from '../content/magazine';
import { useZoomGestures } from '../hooks/useZoomGestures';
import type { ZoomTarget } from '../types/magazine';
import { DialogShell } from './DialogShell';
import { IconButton } from './IconButton';
import { InteractiveChart } from './InteractiveChart';

export function ZoomDialog({ target, svg, onClose }: { target: ZoomTarget; svg: string; onClose: () => void }) {
  const { viewport, transform, zoom, reset, handlers } = useZoomGestures();
  const id = useId().replace(/:/g, '');
  const [highlight, setHighlight] = useState<string | null>(null);
  const [details, setDetails] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const resize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const popupScale = Math.min(Math.min(1120, windowSize.width - 48) / target.box.width, Math.max(90, windowSize.height - 144) / target.box.height);
  const fit = popupScale;
  const artwork = useMemo(() => scopeSvg(svg, `zoom-${id}`).replace(/viewBox="[^"]*"/, `viewBox="${target.box.x} ${target.box.y} ${target.box.width} ${target.box.height}"`), [svg, target, id]);
  useEffect(() => {
    const element = viewport.current;
    const text = [...(element?.querySelectorAll('[data-node-id]') || [])].find(el => el.getAttribute('data-node-id') === highlight);
    text?.classList.add('chart-text-highlight');
    return () => text?.classList.remove('chart-text-highlight');
  }, [highlight, viewport]);
  return <DialogShell title={target.kind === 'page' ? `${String(target.page.number).padStart(2, '0')} · ${target.page.title}` : target.label} kind="zoom" onClose={onClose} style={{ width: target.box.width * popupScale, height: target.box.height * popupScale }}>
    <p className="sr-only">Arraste para mover. Use a pinça, a roda do mouse ou os botões para ampliar. Escape fecha a ampliação.</p>
    <div className="popup-tools" aria-label="Controles da ampliação"><IconButton label="Diminuir zoom" disabled={transform.scale <= 0.5} onClick={() => zoom(1 / 1.25)}><Minus size={17} /></IconButton><output aria-label="Nível de zoom">{Math.round(transform.scale * 100)}%</output><IconButton label="Aumentar zoom" disabled={transform.scale >= 8} onClick={() => zoom(1.25)}><Plus size={17} /></IconButton><IconButton label="Ajustar à tela e restaurar posição" onClick={reset}><Scan size={17} /></IconButton>{target.kind === 'chart' && <IconButton label="Mostrar textos e valores do gráfico" aria-pressed={details} onClick={() => setDetails(!details)}><List size={17} /></IconButton>}</div>
    <div className="zoom-body"><div ref={viewport} className={`zoom-viewport ${target.kind === 'chart' ? 'chart-viewport' : ''}`} {...handlers} onDoubleClick={event => {
      const r = event.currentTarget.getBoundingClientRect();
      if (transform.scale > 1.5) reset(); else zoom(2, event.clientX - r.left - r.width / 2, event.clientY - r.top - r.height / 2);
    }}>
      <div className="zoom-sheet" style={{ width: target.box.width, height: target.box.height, transform: `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px) scale(${fit * transform.scale})` }}><div className="svg-artwork" dangerouslySetInnerHTML={{ __html: artwork }} /></div>
    </div>{target.kind === 'chart' && details && <InteractiveChart details={target.details} onHighlight={setHighlight} />}</div>
  </DialogShell>;
}
