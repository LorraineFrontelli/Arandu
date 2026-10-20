import type { CSSProperties } from 'react';
import { PAGE_COUNT, spreadStart } from '../utils/bookGeometry';

/** Geometric CSS-3D sides underneath the actual interactive page surfaces. */
export function BookVolume({ page }: { page: number }) {
  const start = spreadStart(page);
  const closed = start === 1 || start === PAGE_COUNT;
  const left = start === 1 ? 0 : start === PAGE_COUNT ? 10 : Math.ceil(start / 2);
  const right = 10 - left;
  return <div className="book-volume" aria-hidden="true">
    {(['left', 'right'] as const).map(side => {
      const leaves = side === 'left' ? left : right;
      return <div key={side} className={`paper-stack paper-stack-${side} ${leaves ? '' : 'empty-stack'}`} style={{ '--stack-depth': `${2 + leaves * .55}px` } as CSSProperties}>
        <div className="stack-board" />
        <div className="stack-bottom" />
        <div className="stack-outer" />
        <div className="stack-top" />
      </div>;
    })}
    {!closed && <div className="book-gutter" />}
    <div className={`book-binding ${closed ? 'binding-closed' : ''}`} />
  </div>;
}
