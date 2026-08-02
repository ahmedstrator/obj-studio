import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const miamiDir = path.resolve(__dirname, '../../Miami Vol.1 and 3');

if (!fs.existsSync(miamiDir)) {
  console.log('Miami Vol.1 and 3 directory not found.');
  process.exit(0);
}

const files = fs.readdirSync(miamiDir);
const photoFiles = files.filter((f) => {
  const ext = path.extname(f).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
});

console.log(`Found ${photoFiles.length} photos in Miami Vol.1 and 3.`);

// Sort photo files for deterministic culling
photoFiles.sort();

// Keep every 2nd photo to halve the collection from 53 down to 26 curated photos
const toDelete = photoFiles.filter((_, idx) => idx % 2 === 1);

console.log(`Deleting ${toDelete.length} redundant photos...`);

for (const file of toDelete) {
  const fullPath = path.join(miamiDir, file);
  fs.unlinkSync(fullPath);
}

const remaining = fs.readdirSync(miamiDir);
console.log(`Miami Vol.1 and 3 now contains ${remaining.length} total media items (${remaining.filter(f => !f.endsWith('.mp4')).length} photos + 2 videos).`);
