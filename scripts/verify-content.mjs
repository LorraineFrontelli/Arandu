import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/content/magazine.json'), 'utf8'));
const decode = value => value.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'");
const compact = text => text.replace(/\s+/g, '');
assert.equal(manifest.pages.length, 20, 'A revista deve ter exatamente 20 páginas.');
let checked = 0;
let sourceOnly = 0;
const sourceOnlyNodes = [];
for (const [index, page] of manifest.pages.entries()) {
  assert.equal(page.number, index + 1);
  assert.equal(page.width, 1440); assert.equal(page.height, 1024);
  const svg = fs.readFileSync(path.join(root, 'public', page.svg), 'utf8');
  assert.ok(svg.startsWith('<svg'), `SVG inválido: página ${page.number}`);
  assert.ok(fs.statSync(path.join(root, 'public', page.thumbnail)).size > 0);
  for (const match of svg.matchAll(/__ASSET_BASE__([^"\s]+)/g)) assert.ok(fs.statSync(path.join(root, 'public/assets', match[1])).size > 0, `Imagem ausente: ${match[1]}`);
  const svgTexts = new Map([...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map(match => [match[1].match(/data-node-id="([^"]+)"/)?.[1], decode(match[2].replace(/<[^>]+>/g, ''))]));
  for (const original of page.texts) {
    const actual = svgTexts.get(original.id);
    let resolved = actual;
    if (resolved === undefined) {
      // Mixed-style text is exported as a group of positioned text runs.
      // Reassemble those runs in reading order without changing their geometry.
      const idAt = svg.indexOf(`data-node-id="${original.id}"`);
      if (idAt >= 0) {
        const group = svg.slice(idAt, svg.indexOf('</g>', idAt));
        const runs = [...group.matchAll(/<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/g)].map(match => ({
          x: Number(match[1].match(/\bx="([^"]+)"/)?.[1]),
          y: Number(match[1].match(/\by="([^"]+)"/)?.[1]),
          text: decode(match[2].replace(/<[^>]+>/g, '')),
        }));
        runs.sort((a, b) => Math.abs(a.y - b.y) < 2 ? a.x - b.x : a.y - b.y);
        resolved = runs.map(run => run.text).join('');
      }
    }
    if (resolved === undefined) { sourceOnly++; sourceOnlyNodes.push({ page: page.number, id: original.id }); continue; }
    assert.equal(compact(resolved), compact(original.text), `Texto diferente: página ${page.number}, camada ${original.id}`);
    checked++;
  }
  for (const hotspot of page.hotspots) {
    if (hotspot.kind === 'navigate') assert.ok(hotspot.target >= 1 && hotspot.target <= 20);
    for (const key of ['x', 'y', 'width', 'height']) assert.ok(Number.isFinite(hotspot.box[key]));
  }
}
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(?:tsx?|css|json|svg|html)$/.test(file)) {
      const content = fs.readFileSync(file, 'utf8');
      assert.ok(!new RegExp('fig' + 'd_[a-zA-Z0-9_-]{20,}').test(content), `Credencial encontrada: ${file}`);
      assert.ok(!/https:\/\/(?:figma-alpha-api|s3-alpha|s3\.us-west-2\.amazonaws\.com\/figma)/.test(content), `URL temporária encontrada: ${file}`);
    }
  }
}
scan(path.join(root, 'src')); scan(path.join(root, 'public'));
const fontCss = fs.readFileSync(path.join(root, 'src/styles/fonts.css'), 'utf8');
for (const match of fontCss.matchAll(/url\(['"]?\/([^)'"\s]+)['"]?\)/g)) assert.ok(fs.statSync(path.join(root, 'public', match[1])).size > 0, `Fonte ausente: ${match[1]}`);
console.log(`OK: 20 páginas, ${checked} camadas de texto conferidas, imagens locais e navegação válidas; nenhuma credencial.`);
assert.equal(sourceOnly, 0, `Camadas não conferidas: ${JSON.stringify(sourceOnlyNodes)}`);
