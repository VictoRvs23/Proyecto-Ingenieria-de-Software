import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Configuración para el almacenamiento temporal en memoria
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

// Middleware para procesar y redimensionar imágenes
export const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const uploadPath = 'uploads/';
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}.jpg`;
    const filepath = path.join(uploadPath, filename);

    // Procesar la imagen: redimensionar, optimizar y convertir a JPEG
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',          // Mantiene la proporción, la imagen cabe dentro de 800x800
        withoutEnlargement: true // No agranda imágenes pequeñas
      })
      .jpeg({ 
        quality: 85,            // Calidad del JPEG (0-100)
        progressive: true       // JPEG progresivo para mejor carga web
      })
      .toFile(filepath);

    // Actualizar req.file con la nueva información
    req.file.filename = filename;
    req.file.path = filepath;
    
    next();
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    next(new Error('Error al procesar la imagen'));
  }
};