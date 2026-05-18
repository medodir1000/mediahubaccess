import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { join, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const srcDir = join(root, 'photos', 'portraits');
const outDir = join(root, 'public', 'avatars');
await mkdir(outDir, { recursive: true });

const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png)$/i.test(f));
let totalOut = 0;
const results = [];

for (const f of files) {
  const slug = parse(f).name.toLowerCase();
  const out = join(outDir, `${slug}.webp`);
  const buf = await sharp(join(srcDir, f))
    // displayed at 32-44px diameter, retina 2x = 88px → resize 120 with cover crop to square
    .resize({ width: 120, height: 120, fit: 'cover', position: 'attention' })
    .webp({ quality: 82, effort: 6 })
    .toFile(out);
  totalOut += buf.size;
  results.push({ file: `${slug}.webp`, outKB: Math.round(buf.size / 1024) });
}

console.table(results);
console.log(`\nTotal: ${(totalOut / 1024).toFixed(1)} KB for ${files.length} avatars`);
