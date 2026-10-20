export interface Box { x: number; y: number; width: number; height: number }
export interface TextLayer { id: string; text: string; box: Box }
export interface Hotspot {
  id: string;
  kind: 'navigate' | 'image' | 'chart' | 'link';
  label: string;
  box: Box;
  target?: number;
  href?: string;
  details?: { id: string; text: string }[];
}
export interface MagazinePageData {
  number: number;
  id: string;
  title: string;
  width: number;
  height: number;
  svg: string;
  thumbnail: string;
  texts: TextLayer[];
  hotspots: Hotspot[];
}
export interface ZoomTarget { page: MagazinePageData; box: Box; label: string; kind: 'page' | 'image' | 'chart' | 'reference'; details?: Hotspot['details']; urls?: string[] }
