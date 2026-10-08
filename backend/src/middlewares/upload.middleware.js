// Rasm yuklash (mahsulot rasmlari va to'lov cheklari)
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/default.js';
import prisma from '../database/connection.js';
import { rememberUpload } from '../core/uploads.js';

if (!fs.existsSync(config.uploadsDir)) fs.mkdirSync(config.uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const multerImage = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Faqat rasm yuklash mumkin'));
  },
});

// Yuklangan faylni bazaga ham yozadi — server qayta ishga tushsa ham rasm yo'qolmaydi
async function saveToDatabase(req, res, next) {
  if (!req.file) return next();
  try {
    const data = await fs.promises.readFile(req.file.path);
    await prisma.uploadedFile.create({
      data: { name: req.file.filename, mime: req.file.mimetype, data },
    });
    rememberUpload(req.file.filename);
    next();
  } catch (err) {
    next(err);
  }
}

export const uploadImage = {
  single: (field) => [multerImage.single(field), saveToDatabase],
};

/**
 * Diskda topilmagan rasmni bazadan beradi (va diskka qayta yozib qo'yadi).
 * express.static dan keyin ulanadi.
 */
export async function serveFromDatabase(req, res, next) {
  const name = path.basename(req.params.name);
  try {
    const file = await prisma.uploadedFile.findUnique({ where: { name } });
    if (!file) return next();
    fs.promises.writeFile(path.join(config.uploadsDir, name), file.data).catch(() => {});
    res.set('Content-Type', file.mime);
    res.set('Cache-Control', 'public, max-age=2592000');
    res.send(Buffer.from(file.data));
  } catch (err) {
    next(err);
  }
}

export default uploadImage;
