import { UnsupportedMediaTypeException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const voucherReceiptMulterConfig = {
  storage: diskStorage({
    destination: './uploads/vouchers',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowed.includes(file.mimetype)) {
      // Pasar una HttpException acá hace que Nest responda 415 en vez de
      // 500 (con un Error genérico caería en el handler de errores no
      // controlados).
      return cb(
        new UnsupportedMediaTypeException(
          'Solo se permiten imágenes (JPG, PNG, WEBP) o PDF',
        ),
        false,
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};
