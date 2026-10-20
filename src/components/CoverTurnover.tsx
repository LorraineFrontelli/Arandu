import { useMemo, type CSSProperties } from 'react';
import { scopeSvg } from '../content/magazine';

/** Turn the closed magazine over, instead of reversing through its pages. */
export function CoverTurnover({ front, back, width, height, scale, onComplete }: { front: string; back: string; width: number; height: number; scale: number; onComplete: () => void }) {
  const frontSvg = useMemo(() => scopeSvg(front, 'turnover-front'), [front]);
  const backSvg = useMemo(() => scopeSvg(back, 'turnover-back'), [back]);
  return <div className="cover-turnover" aria-hidden="true" style={{ width, height, '--closed-scale': scale } as CSSProperties}>
    <div className="cover-turnover-rotor" onAnimationEnd={event => { if (event.target === event.currentTarget) onComplete(); }}>
      <div className="turnover-face turnover-back"><div className="svg-artwork" dangerouslySetInnerHTML={{ __html: backSvg }} /></div>
      <div className="turnover-face turnover-front"><div className="svg-artwork" dangerouslySetInnerHTML={{ __html: frontSvg }} /></div>
      <div className="turnover-paper-edge" />
    </div>
  </div>;
}
