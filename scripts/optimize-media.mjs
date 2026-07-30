import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scratchDir = path.resolve(__dirname, '../../');
const appDir = path.resolve(__dirname, '../');
const optimizedDir = path.resolve(appDir, 'public/media');

const ffmpegBin = `"C:\\Program Files\\Topaz Labs LLC\\Topaz Video AI\\ffmpeg.exe"`;

// Ensure target output directory exists
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Discover folders inside /scratch
function getFolders() {
  return fs.readdirSync(scratchDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name !== 'obj-studio' && entryIsNotHidden(e.name))
    .map(e => e.name);
}

function entryIsNotHidden(name) {
  return !name.startsWith('.') && name !== 'node_modules';
}

const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.webm']);

function scanMedia(dir, relPath = '') {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const rel = relPath ? path.join(relPath, entry.name) : entry.name;
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(scanMedia(full, rel));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTS.has(ext)) {
        files.push({ full, rel, ext });
      }
    }
  }
  return files;
}

console.log('[Optimizer] Starting media web optimization...');

const folders = getFolders();

for (const folder of folders) {
  const folderPath = path.join(scratchDir, folder);
  const mediaFiles = scanMedia(folderPath);

  console.log(`\n[Optimizer] Processing folder "${folder}" (${mediaFiles.length} files)...`);

  for (const file of mediaFiles) {
    const outPath = path.join(optimizedDir, folder, file.rel);
    const outDir = path.dirname(outPath);

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const isVideo = ['.mp4', '.mov', '.webm'].includes(file.ext);
    const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(file.ext);

    try {
      if (isVideo) {
        console.log(`  - Compressing Video: ${file.rel}...`);
        
        let filter = "scale='min(1920,iw)':-2";
        if (file.rel.toLowerCase().includes('drone')) {
          filter = "crop=in_w:in_h*0.85,scale='min(1920,iw)':-2";
        }

        const cmd = `${ffmpegBin} -y -i "${file.full}" -vf "${filter}" -c:v h264_mf -b:v 4M -an "${outPath}"`;
        execSync(cmd, { stdio: 'ignore' });
        
        const inSizeMB = (fs.statSync(file.full).size / (1024 * 1024)).toFixed(1);
        const outSizeMB = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(1);
        console.log(`    ✓ ${inSizeMB}MB -> ${outSizeMB}MB`);

      } else if (isImage) {
        console.log(`  - Resizing Image: ${file.rel}...`);
        
        // Convert/resize images using ffmpeg
        const cmd = `${ffmpegBin} -y -i "${file.full}" -vf "scale='min(1920,iw)':-2" -q:v 4 "${outPath}"`;
        execSync(cmd, { stdio: 'ignore' });

        const inSizeMB = (fs.statSync(file.full).size / (1024 * 1024)).toFixed(2);
        const outSizeMB = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
        console.log(`    ✓ ${inSizeMB}MB -> ${outSizeMB}MB`);
      }
    } catch (err) {
      console.error(`    ✗ Error optimizing ${file.rel}:`, err.message);
      // Fallback copy
      fs.copyFileSync(file.full, outPath);
    }
  }
}

console.log('\n[Optimizer] Media optimization complete!');
