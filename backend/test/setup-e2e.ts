import * as dotenv from 'dotenv';
import { generateVAPIDKeys } from 'web-push';

dotenv.config();

const TEST_DATABASE_NAME = process.env.TEST_DATABASE_NAME || 'benjamin_db_test';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida. Revisa el archivo .env');
}

// Apunta a una base de datos de test dedicada para no contaminar la BD de desarrollo
process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
  /\/[^/?#]+(?=[?#]|$)/,
  `/${TEST_DATABASE_NAME}`,
);

// Generar claves VAPID válidas si no están configuradas (p. ej. en CI)
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  const keys = generateVAPIDKeys();
  process.env.VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || keys.publicKey;
  process.env.VAPID_PRIVATE_KEY =
    process.env.VAPID_PRIVATE_KEY || keys.privateKey;
}

if (!process.env.VAPID_SUBJECT) {
  process.env.VAPID_SUBJECT = 'mailto:admin@example.com';
}
