import * as dotenv from 'dotenv';

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
