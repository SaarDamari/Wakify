// Rasterize the brand SVG into Android launcher mipmaps + a Play Store master.
// Run: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/branding/wakify-icon-music.svg');
const FG_SRC = path.join(ROOT, 'assets/branding/wakify-foreground.svg');
const MONO_SRC = path.join(ROOT, 'assets/branding/wakify-monochrome.svg');
const RES = path.join(ROOT, 'android/app/src/main/res');

// Legacy launcher densities (px) for ic_launcher / ic_launcher_round (<API 26).
const DENSITIES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Adaptive-icon foreground layer is 108dp; same density buckets, larger px.
const FG_DENSITIES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

const svg = fs.readFileSync(SRC);
const fgSvg = fs.readFileSync(FG_SRC);
const monoSvg = fs.readFileSync(MONO_SRC);

const circleMask = size =>
  Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );

async function run() {
  // Square master (Play Store listing).
  const masterPath = path.join(ROOT, 'assets/branding/wakify-icon-1024.png');
  await sharp(svg, { density: 384 }).resize(1024, 1024).png().toFile(masterPath);
  console.log('master ->', masterPath);

  for (const [dir, size] of Object.entries(DENSITIES)) {
    const outDir = path.join(RES, dir);
    fs.mkdirSync(outDir, { recursive: true });

    const square = await sharp(svg, { density: 384 })
      .resize(size, size)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), square);

    const round = await sharp(square)
      .composite([{ input: circleMask(size), blend: 'dest-in' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), round);

    console.log(`${dir} -> ${size}px (square + round)`);
  }

  // Adaptive-icon foreground (transparent clock), referenced by anydpi-v26 XML.
  for (const [dir, size] of Object.entries(FG_DENSITIES)) {
    const outDir = path.join(RES, dir);
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(fgSvg, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));
    await sharp(monoSvg, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'ic_launcher_monochrome.png'));
    console.log(`${dir} -> ${size}px (foreground + monochrome)`);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
