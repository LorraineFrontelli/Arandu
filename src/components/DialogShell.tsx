import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export function DialogShell({ title, kind = 'panel', onClose, children, style }: { title: string; kind?: 'panel' | 'zoom'; onClose: () => void; children: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => { dialog.close(); requestAnimationFrame(() => previous?.isConnected && previous.focus()); };
  }, []);
  return <dialog ref={ref} className={`${kind}-dialog`} style={style} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-content">
      {kind === 'zoom' ? <><h2 className="sr-only">{title}</h2><button className="popup-close" aria-label="Fechar ampliação" onClick={onClose}><X size={20} strokeWidth={1.6} /></button></> : <header className="dialog-heading"><h2>{title}</h2><IconButton label="Fechar" onClick={onClose}><X size={22} /></IconButton></header>}
      {children}
    </div>
  </dialog>;
}
