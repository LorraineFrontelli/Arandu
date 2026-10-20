import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

export function useZoomGestures() {
  const viewport = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinch = useRef<{ distance: number; x: number; y: number } | null>(null);
  const zoom = useCallback((factor: number, x = 0, y = 0) => {
    setTransform(old => {
      const scale = Math.min(8, Math.max(0.5, old.scale * factor));
      const ratio = scale / old.scale;
      return { scale, x: x - (x - old.x) * ratio, y: y - (y - old.y) * ratio };
    });
  }, []);
  const reset = useCallback(() => setTransform({ scale: 1, x: 0, y: 0 }), []);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoom(Math.exp(-event.deltaY * 0.002), event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [zoom]);
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    lastPinch.current = null;
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const old = pointers.current.get(event.pointerId);
    if (!old) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      if (lastPinch.current && distance > 0) {
        const rect = event.currentTarget.getBoundingClientRect();
        zoom(distance / lastPinch.current.distance, x - rect.left - rect.width / 2, y - rect.top - rect.height / 2);
        const dx = x - lastPinch.current.x, dy = y - lastPinch.current.y;
        setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
      }
      lastPinch.current = { distance, x, y };
    } else {
      const dx = event.clientX - old.x, dy = event.clientY - old.y;
      setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
    }
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => { pointers.current.delete(event.pointerId); lastPinch.current = null; };
  return { viewport, transform, zoom, reset, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
}
