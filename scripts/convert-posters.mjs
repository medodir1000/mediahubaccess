import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const outDir = join(root, 'public', 'posters');
await mkdir(outDir, { recursive: true });

// Source filename -> meaningful slug (used both as output webp name and React key)
const mapping = {
  'image_9b066416.jpeg':                                                    { slug: 'deadpool-wolverine',  title: 'Deadpool & Wolverine' },
  'Venom-The-Last-Dance-Poster-1200x1500.jpg':                              { slug: 'venom-last-dance',    title: 'Venom: The Last Dance' },
  'zdzzszsz.png':                                                           { slug: 'squid-game-2',        title: 'Squid Game 2' },
  '81y3dWSN-dL._AC_SL1500_.jpg':                                            { slug: 'moana-2',             title: 'Moana 2' },
  '130282284_o.jpg':                                                        { slug: 'arcane',              title: 'Arcane' },
  'dzdzdxz.png':                                                            { slug: 'house-of-dragon',     title: 'House of the Dragon' },
  '646507619_1359546912880333_9102524135902455471_n.jpg':                   { slug: 'the-boys',            title: 'The Boys' },
  'MV5BOTliMTk3ZDAtYTk3NS00NTMwLTk5M2ItYzBkODlmY2VhNTMzXkEyXkFqcGc@._V1_.jpg':{ slug: 'shogun',            title: 'Shōgun' },
  'ee51ae18-dce7-4787-b1b1-d141078484e9.jpg':                               { slug: 'shogun-s2',           title: 'Shōgun: Season 2' },
  '61qLZ5WdrrL._AC_SL1024_.jpg':                                            { slug: 'last-of-us',          title: 'The Last of Us' },
};

let totalIn = 0;
let totalOut = 0;
const results = [];

for (const [src, { slug }] of Object.entries(mapping)) {
  const srcPath = join(root, 'photos', src);
  const dstPath = join(outDir, `${slug}.webp`);

  const meta = await sharp(srcPath).metadata();
  const buf = await sharp(srcPath)
    // posters display at w-72 max = 288px, retina 2x = 576px → resize to 640 max width for headroom
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(dstPath);

  const inSize = meta.size ?? 0;
  totalIn += inSize;
  totalOut += buf.size;

  results.push({
    file: `${slug}.webp`,
    inKB: Math.round(inSize / 1024) || '?',
    outKB: Math.round(buf.size / 1024),
    saved: inSize ? `${Math.round((1 - buf.size / inSize) * 100)}%` : '?',
  });
}

console.table(results);
console.log(`\nTotal: ${(totalIn / 1024).toFixed(0)} KB → ${(totalOut / 1024).toFixed(0)} KB (saved ${(100 * (1 - totalOut / totalIn)).toFixed(0)}%)`);
