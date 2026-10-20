import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const parts = ['Dependências da interface de leitura — licenças originais\n'];
for (const name of ['react', 'react-dom', 'scheduler', 'lucide-react', 'page-flip']) {
  const folder = path.join(root, 'node_modules', name);
  const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
  const license = fs.readdirSync(folder).find(file => /^licen[sc]e(?:\.(?:txt|md))?$/i.test(file));
  if (!license) throw new Error(`Licença não encontrada: ${name}`);
  parts.push(`\n${'='.repeat(72)}\n${name} ${manifest.version}\n${'='.repeat(72)}\n\n${fs.readFileSync(path.join(folder, license), 'utf8')}`);
}
parts.push('\n\nFontes: veja os arquivos LICENSE-* em public/assets/fonts/.\n');
fs.writeFileSync(path.join(root, 'THIRD-PARTY-NOTICES.txt'), parts.join('\n'));
fs.writeFileSync(path.join(root, 'public/THIRD-PARTY-NOTICES.txt'), parts.join('\n'));
console.log('Licenças das dependências reunidas.');
