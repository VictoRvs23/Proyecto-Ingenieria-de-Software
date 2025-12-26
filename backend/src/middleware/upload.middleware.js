import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('No es una imagen! Por favor sube solo imágenes.'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const uploadPath = 'uploads/';
  
    if (!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}.jpg`;
    const filepath = path.join(uploadPath, filename);

    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',          
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,            
        progressive: true      
      })
      .toFile(filepath);

    req.file.filename = filename;
    req.file.path = filepath;
    
    next();
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    next(new Error('Error al procesar la imagen'));
  }
};