/** A page is a printed face; a leaf has an odd front and an even back. */
export const PAGE_COUNT = 20;
export const PAGE_WIDTH = 1440;
export const PAGE_HEIGHT = 1024;

export function nextReadingPage(page: number, count = PAGE_COUNT): number {
  return Math.min(count, page + 1);
}

export function previousReadingPage(page: number): number {
  return Math.max(1, page - 1);
}

export function needsLeafTurn(from: number, to: number): boolean {
  return spreadStart(from) !== spreadStart(to);
}

export function cameraShift(page: number, pageWidth: number): number {
  if (page === 1) return -pageWidth / 2;
  if (page === PAGE_COUNT) return pageWidth / 2;
  return page % 2 === 0 ? pageWidth / 2 : -pageWidth / 2;
}

export function spreadStart(page: number, count = PAGE_COUNT): number {
  const bounded = Math.max(1, Math.min(count, Math.trunc(page)));
  return bounded === 1 || bounded === count ? bounded : bounded - bounded % 2;
}

export function visiblePages(page: number, count = PAGE_COUNT): number[] {
  const start = spreadStart(page, count);
  return start === 1 || start === count ? [start] : [start, start + 1];
}

export function previousSpread(page: number, count = PAGE_COUNT): number {
  const start = spreadStart(page, count);
  return start === count ? count - 2 : Math.max(1, start - 2);
}

export function nextSpread(page: number, count = PAGE_COUNT): number {
  const start = spreadStart(page, count);
  return start === 1 ? 2 : Math.min(count, start + 2);
}

export function leafForPage(page: number): { leaf: number; face: 'front' | 'back' } {
  return { leaf: Math.ceil(page / 2), face: page % 2 ? 'front' : 'back' };
}

export function spreadLabel(page: number, count = PAGE_COUNT): string {
  return visiblePages(page, count).map(p => String(p).padStart(2, '0')).join('–');
}
