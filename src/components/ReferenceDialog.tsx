import { ArrowUpRight } from 'lucide-react';
import type { ZoomTarget } from '../types/magazine';
import { DialogShell } from './DialogShell';

export function ReferenceDialog({ target, onClose }: { target: ZoomTarget; onClose: () => void }) {
  return <DialogShell title="Referência original" onClose={onClose}>
    <div className="reference-content"><p className="reference-text">{target.label}</p><p className="reference-hint">Escolha o endereço original que deseja abrir:</p>{target.urls?.map(url => <a className="reference-link" key={url} href={url} target="_blank" rel="noopener noreferrer"><span>{url}</span><ArrowUpRight size={18} /></a>)}</div>
  </DialogShell>;
}
