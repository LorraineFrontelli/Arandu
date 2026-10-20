import { useMemo } from 'react';
import { scopeSvg } from '../content/magazine';
import type { MagazinePageData, ZoomTarget } from '../types/magazine';

export function MagazinePage({ page, svg, onNavigate, onZoom, highlighted = [] }: { page: MagazinePageData; svg: string; onNavigate: (page: number, label?: string) => void; onZoom: (target: ZoomTarget) => void; highlighted?: string[] }) {
  const artwork = useMemo(() => scopeSvg(svg, `page-${page.number}`), [svg, page.number]);
  return <article className="editorial-page" aria-label={`Página ${page.number}: ${page.title}`} data-page={page.number}>
    <div className="svg-artwork" dangerouslySetInnerHTML={{ __html: artwork }} />
    <div className="sr-only" aria-label="Texto original desta página">{page.texts.map(text => <p key={text.id}>{text.text}</p>)}</div>
    {page.texts.filter(t => highlighted.includes(t.id)).map(t => <div key={t.id} className="search-highlight" style={{ left: `${t.box.x / 14.4}%`, top: `${t.box.y / 10.24}%`, width: `${t.box.width / 14.4}%`, height: `${t.box.height / 10.24}%` }} />)}
    {page.hotspots.map(hotspot => {
      const style = { left: `${hotspot.box.x / 14.4}%`, top: `${hotspot.box.y / 10.24}%`, width: `${hotspot.box.width / 14.4}%`, height: `${hotspot.box.height / 10.24}%` };
      if (hotspot.kind === 'link') {
        const urls = [...new Set([...hotspot.label.matchAll(/https?:\/\/[^\s<>]+/g)].map(match => match[0].replace(/[.,;]+$/, '')))];
        if (urls.length > 1) return <button type="button" key={hotspot.id} className="hotspot link-hotspot" style={style} aria-label={`Abrir os ${urls.length} links desta referência`} title="Ver referência e escolher um dos links originais" onClick={event => { event.stopPropagation(); onZoom({ page, box: hotspot.box, label: hotspot.label, kind: 'reference', urls }); }} />;
        return <a key={hotspot.id} className="hotspot link-hotspot" style={style} href={hotspot.href} target={hotspot.href?.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" aria-label={hotspot.label} title={hotspot.href} />;
      }
      return <button key={hotspot.id} type="button" className={`hotspot ${hotspot.kind}-hotspot`} style={style} aria-label={hotspot.kind === 'navigate' ? hotspot.label : hotspot.label} title={hotspot.kind === 'navigate' ? hotspot.label : `${hotspot.label} · Clique para ampliar`} data-hotspot={hotspot.kind} onClick={event => {
        event.stopPropagation();
        if (hotspot.kind === 'navigate') onNavigate(hotspot.target!, hotspot.label);
        else onZoom({ page, box: hotspot.box, label: hotspot.label, kind: hotspot.kind === 'chart' ? 'chart' : 'image', details: hotspot.details });
      }} />;
    })}
  </article>;
}
