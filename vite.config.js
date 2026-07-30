import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scratchDir = path.resolve(__dirname, '..');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'scratch-media-server',
      configureServer(server) {
        server.middlewares.use('/scratch-media', (req, res, next) => {
          try {
            const relativePath = decodeURIComponent(req.url.replace(/^\//, ''));
            const filePath = path.join(scratchDir, relativePath);

            if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
              res.statusCode = 404;
              return res.end('File not found');
            }

            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const ext = path.extname(filePath).toLowerCase();

            const mimeTypes = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.mp4': 'video/mp4',
              '.mov': 'video/quicktime',
              '.webm': 'video/webm'
            };

            const contentType = mimeTypes[ext] || 'application/octet-stream';
            const range = req.headers.range;

            if (range) {
              const parts = range.replace(/bytes=/, "").split("-");
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
              const chunksize = (end - start) + 1;
              const file = fs.createReadStream(filePath, { start, end });
              const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
              };
              res.writeHead(206, head);
              file.pipe(res);
            } else {
              const head = {
                'Content-Length': fileSize,
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=3600'
              };
              res.writeHead(200, head);
              fs.createReadStream(filePath).pipe(res);
            }
          } catch (err) {
            console.error('Scratch media error:', err);
            res.statusCode = 500;
            res.end('Server Error');
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    fs: {
      allow: [scratchDir]
    }
  }
});
