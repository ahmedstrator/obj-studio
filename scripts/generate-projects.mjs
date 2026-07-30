import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scratchDir = path.resolve(__dirname, '../../');
const appDir = path.resolve(__dirname, '../');
const publicDir = path.resolve(appDir, 'public');
const isProduction = process.env.NODE_ENV === 'production';

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Find data.md or data.md.txt
let dataFilePath = path.join(scratchDir, 'data.md');
if (!fs.existsSync(dataFilePath)) {
  dataFilePath = path.join(scratchDir, 'data.md.txt');
}

if (!fs.existsSync(dataFilePath)) {
  const existingManifest = path.join(publicDir, 'projects.json');
  if (fs.existsSync(existingManifest)) {
    console.log(`[Build Pipeline] data.md not found in ${scratchDir}. Using existing manifest ${existingManifest}`);
    process.exit(0);
  }
  console.error(`[Error] data.md not found in ${scratchDir}`);
  process.exit(1);
}

const dataContent = fs.readFileSync(dataFilePath, 'utf-8');

// Parse Display Order section
function parseDisplayOrder(content) {
  const orderSectionMatch = content.match(/# Display Order\s*([\s\S]*?)(?=\n---|\n#|$)/i);
  if (!orderSectionMatch) return [];

  const lines = orderSectionMatch[1].split('\n');
  const orderList = [];

  for (const line of lines) {
    const match = line.match(/^\d+\.\s*(.+)/);
    if (match) {
      orderList.push(match[1].trim());
    }
  }
  return orderList;
}

// Parse Projects Metadata
function parseProjects(content) {
  const projectBlocks = content.split(/^#\s+\d+\s+—\s+/m).slice(1);
  const projectsMap = new Map();

  for (const block of projectBlocks) {
    const lines = block.split('\n');
    const title = lines[0].trim();
    const projectData = {
      title,
      year: '',
      category: '',
      client: '',
      description: '',
      services: [],
      importance: ''
    };

    let currentField = null;
    let descriptionLines = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line === '---') continue;

      if (line.startsWith('**Year**')) {
        currentField = 'year';
        projectData.year = lines[i + 1] ? lines[i + 1].trim() : '';
      } else if (line.startsWith('**Category**')) {
        currentField = 'category';
        projectData.category = lines[i + 1] ? lines[i + 1].trim() : '';
      } else if (line.startsWith('**Client**')) {
        currentField = 'client';
        projectData.client = lines[i + 1] ? lines[i + 1].trim() : '';
      } else if (line.startsWith('**Description**')) {
        currentField = 'description';
        descriptionLines = [];
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('**')) {
          if (lines[j].trim()) descriptionLines.push(lines[j].trim());
          j++;
        }
        projectData.description = descriptionLines.join(' ');
      } else if (line.startsWith('**Importance**')) {
        projectData.importance = lines[i + 1] ? lines[i + 1].trim() : '';
      }
    }

    projectsMap.set(title.toLowerCase(), projectData);
  }

  return projectsMap;
}

// Discover all subdirectories in scratch directory (excluding app folder)
function getProjectFolders() {
  const entries = fs.readdirSync(scratchDir, { withFileTypes: true });
  const folders = [];

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'obj-studio' && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      folders.push(entry.name);
    }
  }
  return folders;
}

// Normalize text for matching
function normalizeStr(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Match project title to folder name
function matchTitleToFolder(title, folders) {
  const normTitle = normalizeStr(title);

  // Known folder overrides map
  const explicitMap = {
    'rawa2e3elsunbati': 'sunbati',
    'elsunbati': 'sunbati',
    'sunbati': 'sunbati',
    'abdulmajidabdallah': 'abdul majid',
    'abdulmajid': 'abdul majid',
    'baladbeast': 'Balad beast 2024',
    'zbyzidan': 'Zidan',
    'zidan': 'Zidan',
    'riyadhmetro': 'Metro riyadh',
    'onebillionsummit': 'One billion summit',
    'fomex': 'FOMEX',
    'miami1': 'Miami 1',
    'miami3': 'Miami 3'
  };

  if (explicitMap[normTitle]) {
    const targetFolder = explicitMap[normTitle];
    if (folders.includes(targetFolder)) return targetFolder;
  }

  // Exact or normalized match
  for (const folder of folders) {
    const normFolder = normalizeStr(folder);
    if (normTitle === normFolder) return folder;
  }

  // Token matching (e.g., "riyadh metro" <-> "metro riyadh", "z by zidan" <-> "zidan")
  const titleTokens = title.toLowerCase().split(/\s+/);
  let bestMatch = null;
  let maxScore = 0;

  for (const folder of folders) {
    const folderTokens = folder.toLowerCase().split(/\s+/);
    let matchCount = 0;

    for (const t of titleTokens) {
      if (t.length > 2 && folderTokens.some(f => f.includes(t) || t.includes(f))) {
        matchCount++;
      }
    }

    if (matchCount > maxScore) {
      maxScore = matchCount;
      bestMatch = folder;
    }
  }

  return bestMatch;
}

// Supported extensions
const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.webm']);

// Recursively find media files inside a directory
function scanMediaFiles(dirPath, relativePrefix = '') {
  let mediaFiles = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const relPath = relativePrefix ? path.join(relativePrefix, entry.name) : entry.name;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      mediaFiles = mediaFiles.concat(scanMediaFiles(fullPath, relPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTS.has(ext)) {
        mediaFiles.push({
          name: entry.name,
          relativePath: relPath.replace(/\\/g, '/'),
          ext,
          isVideo: ['.mp4', '.mov', '.webm'].includes(ext),
          isImage: ['.jpg', '.jpeg', '.png', '.webp'].includes(ext),
          fullPath
        });
      }
    }
  }

  return mediaFiles;
}

// Execute generator
const displayOrder = parseDisplayOrder(dataContent);
const parsedProjectsMap = parseProjects(dataContent);
const availableFolders = getProjectFolders();

console.log(`[Build Pipeline] Found ${availableFolders.length} folders in /scratch:`, availableFolders);
console.log(`[Build Pipeline] Display order (${displayOrder.length} projects):`, displayOrder);

const finalProjectsList = [];

// Iterate through projects in specified display order
displayOrder.forEach((title, index) => {
  const matchedFolder = matchTitleToFolder(title, availableFolders);
  const metadata = parsedProjectsMap.get(title.toLowerCase()) || {
    title,
    year: '2024',
    category: 'Selected Work',
    client: 'OBJ Studio',
    description: ''
  };

  let mediaItems = [];
  if (matchedFolder) {
    const folderFullPath = path.join(scratchDir, matchedFolder);
    const discoveredFiles = scanMediaFiles(folderFullPath);

    // Copy to public/media if production build
    const mediaDestDir = path.join(publicDir, 'media', matchedFolder);
    if (isProduction && !fs.existsSync(mediaDestDir)) {
      fs.mkdirSync(mediaDestDir, { recursive: true });
    }

    discoveredFiles.forEach(file => {
      let mediaUrl = `/scratch-media/${matchedFolder}/${file.relativePath}`;

      if (isProduction) {
        const destFilePath = path.join(mediaDestDir, file.relativePath);
        const destSubDir = path.dirname(destFilePath);
        if (!fs.existsSync(destSubDir)) {
          fs.mkdirSync(destSubDir, { recursive: true });
        }
        // Copy file for production output only if not present
        if (!fs.existsSync(destFilePath)) {
          fs.copyFileSync(file.fullPath, destFilePath);
        }
        mediaUrl = `/media/${matchedFolder}/${file.relativePath}`;
      }

      mediaItems.push({
        id: `${matchedFolder}-${file.relativePath}`,
        url: mediaUrl,
        type: file.isVideo ? 'video' : 'image',
        filename: file.name
      });
    });
  }

  // Sort media: primary videos or background videos first, then secondary items
  mediaItems.sort((a, b) => {
    if (a.filename.toLowerCase().includes('background')) return -1;
    if (b.filename.toLowerCase().includes('background')) return 1;
    if (a.type === 'video' && b.type === 'image') return -1;
    if (a.type === 'image' && b.type === 'video') return 1;
    return a.filename.localeCompare(b.filename);
  });

  finalProjectsList.push({
    id: `project-${index + 1}`,
    number: String(index + 1).padStart(2, '0'),
    title: metadata.title,
    year: metadata.year,
    category: metadata.category,
    client: metadata.client,
    description: metadata.description,
    folder: matchedFolder,
    media: mediaItems
  });
});

const outputManifest = {
  studio: "OBJ Studio",
  totalProjects: finalProjectsList.length,
  generatedAt: new Date().toISOString(),
  projects: finalProjectsList
};

const manifestPath = path.join(publicDir, 'projects.json');
fs.writeFileSync(manifestPath, JSON.stringify(outputManifest, null, 2), 'utf-8');

console.log(`[Build Pipeline] Successfully generated ${manifestPath} with ${finalProjectsList.length} projects.`);
