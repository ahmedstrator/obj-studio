import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scratchDir = path.resolve(__dirname, '../../');
const miami3Dir = path.join(scratchDir, 'Miami 3');
const ffmpegBin = `"C:\\Program Files\\Softdeluxe\\Free Download Manager\\ffmpeg.exe"`;

console.log('[Compressor] Starting Miami 3 photos compression...');

function scanImages(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanImages(full));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

const images = scanImages(miami3Dir);
console.log(`Found ${images.length} images in Miami 3 folder.`);

let compressedCount = 0;
let totalSavedBytes = 0;

for (const imgPath of images) {
  const origSize = fs.statSync(imgPath).size;
  const tempOut = imgPath + '.tmp.jpg';

  try {
    const cmd = `${ffmpegBin} -y -i "${imgPath}" -vf "scale='min(1920,iw)':-2" -q:v 4 "${tempOut}"`;
    execSync(cmd, { stdio: 'ignore' });

    const newSize = fs.statSync(tempOut).size;

    if (newSize < origSize) {
      fs.unlinkSync(imgPath);
      fs.renameSync(tempOut, imgPath);
      compressedCount++;
      totalSavedBytes += (origSize - newSize);
      console.log(`  ✓ Compressed: ${path.basename(imgPath)} (${(origSize / 1024 / 1024).toFixed(1)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB)`);
    } else {
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
    }
  } catch (err) {
    console.error(`  ✗ Error compressing ${path.basename(imgPath)}:`, err.message);
    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
  }
}

const savedMB = (totalSavedBytes / 1024 / 1024).toFixed(1);
console.log(`\n[Compressor] Complete! Compressed ${compressedCount} photos in Miami 3. Saved ${savedMB} MB total!`);
