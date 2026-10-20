import data from './magazine.json';
import type { MagazinePageData } from '../types/magazine';
import { visiblePages } from '../utils/bookGeometry';

export const magazine = { ...data, pages: data.pages as MagazinePageData[] };
export const pages = magazine.pages;
export const assetUrl = (relative: string) => `${import.meta.env.BASE_URL}${relative}`;
export const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const imagePromises = new Map<string, Promise<void>>();

export function preloadArtworkImages(svg: string) {
  const urls = [...svg.matchAll(/(?:xlink:)?href="(__ASSET_BASE__images\/[^\"]+)"/g)].map(match => match[1].replace('__ASSET_BASE__', assetUrl('assets/')));
  return Promise.all(urls.map(url => {
    if (!imagePromises.has(url)) imagePromises.set(url, new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => { void image.decode().then(resolve).catch(() => { imagePromises.delete(url); reject(new Error('Uma imagem da revista não pôde ser preparada. Tente novamente.')); }); };
      image.onerror = () => { imagePromises.delete(url); reject(new Error('Uma imagem da revista não carregou. Tente novamente.')); };
      image.src = url;
    }));
    return imagePromises.get(url)!;
  }));
}

export function scopeSvg(svg: string, scope: string) {
  return svg
    .replace(/(\s)id="([^"]+)"/g, (_, space: string, id: string) => `${space}id="${scope}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${scope}-${id})`)
    .replace(/((?:xlink:)?href)="#([^"]+)"/g, (_, attribute: string, id: string) => `${attribute}="#${scope}-${id}"`)
    .replaceAll('__ASSET_BASE__', assetUrl('assets/'));
}

export async function loadArtwork(onProgress: (done: number) => void, firstPage = 1) {
  let done = 0;
  const result = await Promise.all(pages.map(async page => {
    const response = await fetch(assetUrl(page.svg));
    if (!response.ok) throw new Error(`Não foi possível carregar a página ${page.number}.`);
    const svg = await response.text();
    if (!svg.startsWith('<svg')) throw new Error(`Arquivo inválido na página ${page.number}.`);
    onProgress(++done);
    return svg;
  }));
  await Promise.all([
    ...visiblePages(firstPage).map(number => preloadArtworkImages(result[number - 1])),
    ...[600, 800, 900].map(weight => document.fonts.load(`${weight} 24px "Barlow Condensed"`, 'àéç')),
    ...[400, 500, 600, 700].flatMap(weight => [
      document.fonts.load(`${weight} 24px Playfair`, 'àéç'),
      document.fonts.load(`italic ${weight} 24px Playfair`, 'àéç'),
    ]),
    document.fonts.load('400 24px "Bodoni Moda"', 'àéç'),
  ]);
  return result;
}
