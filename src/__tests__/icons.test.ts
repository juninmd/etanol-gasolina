import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '..');
const EVA_INDEX = path.join(
  require.resolve('react-native-eva-icons/package.json'),
  '..',
  'icons',
  'index.js',
);

const listFiles = (dir: string): string[] =>
  fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : listFiles(full);
    }
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });

// Nome de ícone inexistente no Eva renderiza elemento undefined e fecha o app.
describe('ícones Eva usados no app', () => {
  it('existem todos no conjunto do react-native-eva-icons', () => {
    const eva = fs.readFileSync(EVA_INDEX, 'utf8');
    const used = new Set<string>();
    const pattern =
      /(?:name="|[iI]con\w*: '|[iI]con\w* ?= ?')([a-z0-9]+(?:-[a-z0-9]+)*)['"]/g;
    listFiles(SRC).forEach(file => {
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(pattern)) {
        used.add(match[1]);
      }
    });
    const missing = [...used].filter(n => !eva.includes(`case '${n}':`));
    expect(missing).toEqual([]);
  });
});
