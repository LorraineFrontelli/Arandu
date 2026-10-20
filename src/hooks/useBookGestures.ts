import { useEffect, useRef } from 'react';
import type { PageFlip } from 'page-flip';
import { needsLeafTurn, nextReadingPage, previousReadingPage } from '../utils/bookGeometry';

type Point = { x: number; y: number };
type Input = { clientX: number; clientY: number; currentTarget: HTMLDivElement; target: EventTarget | null; preventDefault: () => void };
type Gesture = { channel: 'pointer' | 'mouse' | 'touch'; pointer: number; page: number; x: number; y: number; start: Point; mount: HTMLDivElement; mode: 'pending' | 'camera' | 'leaf'; target: number; touch: boolean };

export function useBookGestures(engine: { current: PageFlip | null }, page: { current: number }, navigate: { current: (number: number) => void }, leafTarget: { current: number | null }, mount: { current: HTMLDivElement | null }) {
  const gesture = useRef<Gesture | null>(null);
  const suppressClickUntil = useRef(0);
  const local = (event: Input): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * event.currentTarget.offsetWidth / rect.width, y: (event.clientY - rect.top) * event.currentTarget.offsetHeight / rect.height };
  };
  const begin = (event: Input, channel: Gesture['channel'], pointer: number, touch: boolean) => {
    if (gesture.current || engine.current?.getState() !== 'read' || page.current === 1 || page.current === 20) return;
    const source = event.target as Element;
    const zoomHotspot = source.closest('.image-hotspot, .chart-hotspot');
    if (source.closest('button, a, [data-no-flip]') && !zoomHotspot || !touch && source.closest('text')) return;
    suppressClickUntil.current = 0;
    gesture.current = { channel, pointer, page: page.current, x: event.clientX, y: event.clientY, start: local(event), mount: event.currentTarget, mode: 'pending', target: page.current, touch };
    if (!touch && !zoomHotspot) event.preventDefault();
  };
  const move = (event: Input) => {
    const active = gesture.current;
    const flip = engine.current;
    if (!active || !flip) return;
    const dx = event.clientX - active.x, dy = event.clientY - active.y;
    if (active.mode === 'pending') {
      if (Math.abs(dx) < 10) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.3) { gesture.current = null; return; }
      active.target = dx < 0 ? nextReadingPage(active.page) : previousReadingPage(active.page);
      active.mode = needsLeafTurn(active.page, active.target) ? 'leaf' : 'camera';
      if (active.channel === 'pointer') active.mount.setPointerCapture(active.pointer);
      if (active.mode === 'leaf') {
        leafTarget.current = active.target;
        flip.startUserTouch(active.start);
        // Establish direction before a fast pointer jump crosses the spine.
        flip.userMove({ x: active.start.x + (dx < 0 ? -7 : 7), y: active.start.y }, true);
      }
    }
    event.preventDefault();
    if (active.mode === 'leaf') flip.userMove(local(event), true);
  };
  const finish = (event: Input, cancel = false) => {
    const active = gesture.current;
    if (!active) return;
    gesture.current = null;
    if (active.mode !== 'pending') suppressClickUntil.current = performance.now() + 400;
    const flip = engine.current;
    if (active.mode === 'leaf' && flip) {
      const point = cancel ? active.start : local(event);
      if (cancel) flip.userMove(point, true);
      else if (active.touch && Math.abs(event.clientX - active.x) > 40) {
        const width = Number(flip.getSettings().width);
        point.x = active.target > active.page ? width * .35 : width * 1.65;
        flip.userMove(point, true);
      }
      flip.userStop(point);
    } else if (active.mode === 'camera' && !cancel && Math.abs(event.clientX - active.x) > 35) navigate.current(active.target);
  };
  useEffect(() => {
    const element = mount.current;
    if (!element) return;
    const input = (event: { clientX: number; clientY: number; target: EventTarget | null; preventDefault: () => void }): Input => ({ target: event.target, currentTarget: element, clientX: event.clientX, clientY: event.clientY, preventDefault: () => event.preventDefault() });
    const pointerDown = (event: globalThis.PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      begin(input(event), 'pointer', event.pointerId, event.pointerType !== 'mouse');
    };
    const pointerMove = (event: globalThis.PointerEvent) => { if (gesture.current?.channel === 'pointer' && gesture.current.pointer === event.pointerId) move(input(event)); };
    const pointerEnd = (event: globalThis.PointerEvent) => { if (gesture.current?.channel === 'pointer' && gesture.current.pointer === event.pointerId) finish(input(event), event.type !== 'pointerup'); };
    const mouseDown = (event: globalThis.MouseEvent) => { if (event.button === 0) begin(input(event), 'mouse', 1, false); };
    const touchStart = (event: globalThis.TouchEvent) => {
      if (event.touches.length !== 1) return;
      const point = event.changedTouches[0];
      begin({ target: event.target, currentTarget: element, clientX: point.clientX, clientY: point.clientY, preventDefault: () => event.preventDefault() }, 'touch', point.identifier, true);
    };
    const preventDraggedClick = (event: Event) => {
      if (performance.now() < suppressClickUntil.current) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    // Mouse/Touch fallbacks cover WebViews and older Safari input paths which
    // dispatch traditional events without the equivalent Pointer Events.
    const mouseInput = (event: globalThis.MouseEvent): Input | null => gesture.current?.channel === 'mouse' ? { ...event, target: event.target, currentTarget: gesture.current.mount, clientX: event.clientX, clientY: event.clientY, preventDefault: () => event.preventDefault() } : null;
    const mouseMove = (event: globalThis.MouseEvent) => { const input = mouseInput(event); if (input) move(input); };
    const mouseUp = (event: globalThis.MouseEvent) => { const input = mouseInput(event); if (input) finish(input); };
    const touchInput = (event: globalThis.TouchEvent): Input | null => {
      const active = gesture.current;
      if (active?.channel !== 'touch') return null;
      const touch = [...event.changedTouches].find(point => point.identifier === active.pointer);
      return touch ? { target: event.target, currentTarget: active.mount, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => { if (event.cancelable) event.preventDefault(); } } : null;
    };
    const touchMove = (event: globalThis.TouchEvent) => { const input = touchInput(event); if (input) move(input); };
    const touchEnd = (event: globalThis.TouchEvent) => { const input = touchInput(event); if (input) finish(input, event.type === 'touchcancel'); };
    // Pages live in React portals moved into the engine's DOM. Their React
    // ancestry does not include book-mount, so bind native listeners here.
    element.addEventListener('pointerdown', pointerDown);
    element.addEventListener('click', preventDraggedClick, true);
    element.addEventListener('lostpointercapture', pointerEnd);
    element.addEventListener('mousedown', mouseDown);
    element.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerEnd);
    window.addEventListener('pointercancel', pointerEnd);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchEnd);
    window.addEventListener('touchcancel', touchEnd);
    return () => {
      element.removeEventListener('pointerdown', pointerDown); element.removeEventListener('lostpointercapture', pointerEnd);
      element.removeEventListener('click', preventDraggedClick, true);
      element.removeEventListener('mousedown', mouseDown); element.removeEventListener('touchstart', touchStart);
      window.removeEventListener('pointermove', pointerMove); window.removeEventListener('pointerup', pointerEnd); window.removeEventListener('pointercancel', pointerEnd);
      window.removeEventListener('mousemove', mouseMove); window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchmove', touchMove); window.removeEventListener('touchend', touchEnd); window.removeEventListener('touchcancel', touchEnd);
    };
  }, []);
}
