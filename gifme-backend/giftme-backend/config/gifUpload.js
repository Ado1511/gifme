import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento para los GIFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/gifs'); // Carpeta de destino correcta
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext); // Nombre único + extensión original
  },
});

// Filtro para asegurarnos que solo sean .gif
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.gif') {
    return cb(new Error('Only GIF files are allowed'), false);
  }
  cb(null, true);
};

// Crear el upload middleware
const gifUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB
});

export default gifUpload;
