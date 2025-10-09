import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear un usuario por defecto
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Usuario Default',
      age: 25,
      password: hashedUserPassword,
      role: 'user',
    },
  });

  // Crear un admin por defecto
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@test.com' },
    update: {
      password: hashedAdminPassword, // Actualizar contraseña si ya existe
    },
    create: {
      email: 'admin@test.com',
      name: 'Admin Default',
      age: 30,
      password: hashedAdminPassword,
      role: 'admin',
    },
  });

  console.log('Seed completado:', { user, admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
