import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const router = Router();
const execAsync = promisify(exec);

const BASE_DIR = process.env.FILE_BASE_DIR || '/';

function sanitizePath(userPath: string): string {
  const normalized = path.normalize(userPath).replace(/^(\.\.[\/\\])+/, '');
  return path.join(BASE_DIR, normalized);
}

router.get('/list', async (req, res) => {
  try {
    const dirPath = sanitizePath(req.query.path as string || '/');
    
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Not a directory' });
    }

    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    const fileList = files.map(file => ({
      name: file.name,
      path: path.join(dirPath, file.name),
      isDirectory: file.isDirectory(),
      size: file.isFile() ? fs.statSync(path.join(dirPath, file.name)).size : 0,
      modified: file.isFile() ? fs.statSync(path.join(dirPath, file.name)).mtime.toISOString() : null,
    }));

    res.json({
      path: dirPath,
      files: fileList,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/read', async (req, res) => {
  try {
    const filePath = sanitizePath(req.query.path as string || '');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Cannot read a directory' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({
      path: filePath,
      content,
      size: stats.size,
      modified: stats.mtime.toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/write', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    const sanitizedPath = sanitizePath(filePath);
    
    const dir = path.dirname(sanitizedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(sanitizedPath, content);
    res.json({ message: 'File written successfully', path: sanitizedPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mkdir', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    const sanitizedPath = sanitizePath(dirPath);
    
    fs.mkdirSync(sanitizedPath, { recursive: true });
    res.json({ message: 'Directory created', path: sanitizedPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rename', async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    const oldSanitized = sanitizePath(oldPath);
    const newSanitized = sanitizePath(newPath);
    
    fs.renameSync(oldSanitized, newSanitized);
    res.json({ message: 'File renamed', oldPath: oldSanitized, newPath: newSanitized });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const filePath = sanitizePath(req.query.path as string || '');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'File deleted', path: filePath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', async (req, res) => {
  try {
    const { path: filePath, content, encoding = 'base64' } = req.body;
    const sanitizedPath = sanitizePath(filePath);
    
    const dir = path.dirname(sanitizedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = Buffer.from(content, encoding as BufferEncoding);
    fs.writeFileSync(sanitizedPath, buffer);
    
    res.json({ message: 'File uploaded', path: sanitizedPath, size: buffer.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/download', async (req, res) => {
  try {
    const filePath = sanitizePath(req.query.path as string || '');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Cannot download a directory' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader('Content-Length', stats.size);
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const dirPath = sanitizePath(req.query.path as string || '/');
    
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    let totalSize = 0;
    let fileCount = 0;
    let dirCount = 0;

    function calculateSize(dir: string) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          dirCount++;
          calculateSize(filePath);
        } else {
          fileCount++;
          totalSize += stats.size;
        }
      }
    }

    calculateSize(dirPath);

    res.json({
      path: dirPath,
      totalSize,
      fileCount,
      dirCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { path: searchPath, pattern } = req.query;
    const dirPath = sanitizePath(searchPath as string || '/');
    
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const { stdout } = await execAsync(`find "${dirPath}" -name "*${pattern}*" -type f 2>/dev/null | head -100`);
    const files = stdout.trim().split('\n').filter(Boolean);

    res.json({
      path: dirPath,
      pattern,
      files: files.map(f => ({
        path: f,
        name: path.basename(f),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
