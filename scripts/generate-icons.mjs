import sharp from 'sharp';
import { copyFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

const root = resolve(process.cwd());
const ICON = resolve(root, 'assets/falah-icon.svg');
const FG = resolve(root, 'assets/falah-foreground.svg');
const MASK = resolve(root, 'assets/falah-maskable.svg');
const ensure = (p) => mkdirSync(dirname(resolve(root, p)), { recursive: true });

async function png(srcSvg, size, outPath, { round = false } = {}) {
  ensure(outPath);
  let img = sharp(srcSvg, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  if (round) {
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
    );
    img = img.composite([{ input: mask, blend: 'dest-in' }]);
  }
  await img.png().toFile(resolve(root, outPath));
  console.log('wrote', outPath);
}

// PWA / web (from full composed icon)
ensure('public/favicon.svg');
copyFileSync(ICON, resolve(root, 'public/favicon.svg'));
await png(ICON, 192, 'public/pwa-192x192.png');
await png(ICON, 512, 'public/pwa-512x512.png');
await png(ICON, 180, 'public/apple-touch-icon.png');
// Maskable PWA icon — full-bleed (no rounded corners) so it crops safely under any mask
await png(MASK, 512, 'public/pwa-512x512-maskable.png');

// Android legacy launcher icons (square + round)
const launcher = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [d, s] of Object.entries(launcher)) {
  await png(ICON, s, `android/app/src/main/res/mipmap-${d}/ic_launcher.png`);
  await png(ICON, s, `android/app/src/main/res/mipmap-${d}/ic_launcher_round.png`, { round: true });
}

// Android adaptive foreground (108dp at each density)
const fg = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };
for (const [d, s] of Object.entries(fg)) {
  await png(FG, s, `android/app/src/main/res/mipmap-${d}/ic_launcher_foreground.png`);
}

console.log('done');
