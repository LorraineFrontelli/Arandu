declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, number | string | boolean>);
    loadFromHTML(elements: HTMLElement[]): void;
    on(event: 'flip', handler: (event: { data: number }) => void): void;
    on(event: 'changeState', handler: (event: { data: string }) => void): void;
    getCurrentPageIndex(): number;
    getState(): string;
    getSettings(): Record<string, number | string | boolean>;
    getRender(): { finishAnimation(): void };
    startUserTouch(point: { x: number; y: number }): void;
    userMove(point: { x: number; y: number }, isTouch: boolean): void;
    userStop(point: { x: number; y: number }, isSwipe?: boolean): void;
    update(): void;
    turnToPage(index: number): void;
    flip(index: number, corner?: 'top' | 'bottom'): void;
    destroy(): void;
  }
}
