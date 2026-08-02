import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scratchDir = path.resolve(__dirname, '../../');
const ffmpegBin = `"C:\\Program Files\\Topaz Labs LLC\\Topaz Video AI\\ffmpeg.exe"`;

console.log('[Web Optimizer] Scanning for heavy raw videos in /scratch...');

function scanVideos(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanVideos(full));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.mp4', '.mov'].includes(ext) && !entry.name.includes('_web.mp4')) {
        results.push(full);
      }
    }
  }
  return results;
}

const videos = scanVideos(scratchDir);
console.log(`Found ${videos.length} videos.`);

for (const vidPath of videos) {
  const origSize = fs.statSync(vidPath).size;
  const origMB = (origSize / 1024 / 1024).toFixed(1);

  // If video is under 15MB, skip re-encoding
  if (origSize < 15 * 1024 * 1024) {
    console.log(`  - Skipped (already light): ${path.basename(vidPath)} (${origMB} MB)`);
    continue;
  }

  const tempOut = vidPath + '.web.mp4';
  console.log(`  ⚙ Optimizing: ${path.basename(vidPath)} (${origMB} MB)...`);

  try {
    // Encode to 1080p H.264 web MP4 using Windows Media Foundation GPU encoder
    const cmd = `${ffmpegBin} -y -i "${vidPath}" -vf "scale='min(1920,iw)':-2" -c:v h264_mf -b:v 8M -movflags +faststart -c:a aac -b:a 128k "${tempOut}"`;
    execSync(cmd, { stdio: 'ignore' });

    const newSize = fs.statSync(tempOut).size;
    const newMB = (newSize / 1024 / 1024).toFixed(1);

    if (newSize < origSize) {
      fs.unlinkSync(vidPath);
      fs.renameSync(tempOut, vidPath);
      console.log(`    ✓ Compressed: ${path.basename(vidPath)} (${origMB} MB -> ${newMB} MB)`);
    } else {
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
    }
  } catch (err) {
    console.error(`    ✗ Error compressing ${path.basename(vidPath)}:`, err.message);
    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
  }
}

console.log('\n[Web Optimizer] All video optimizations complete!');
