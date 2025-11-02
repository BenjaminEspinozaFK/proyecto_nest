import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const emailUser = process.env.USER_EMAIL;
  const passUser = process.env.USER_PASS;

  if (!emailUser || !passUser) {
    throw new Error(
      'La variable de entorno USER_EMAIL o USER_PASS no esta definida',
    );
  }

  const hashedUserPassword = await bcrypt.hash(passUser, 10);

  const user = await prisma.user.upsert({
    where: { email: emailUser },
    update: {},
    create: {
      email: emailUser,
      name: 'Usuario Default',
      age: 25,
      password: hashedUserPassword,
      role: 'user',
    },
  });

  const emailAdmin = process.env.ADMIN_EMAIL;
  const passAdmin = process.env.ADMIN_PASS;

  if (!emailAdmin || !passAdmin) {
    throw new Error(
      'La variable de entorno ADMIN_EMAIL o ADMIN_PASS no esta definida',
    );
  }

  const hashedAdminPassword = await bcrypt.hash(passAdmin, 10);

  const admin = await prisma.admin.upsert({
    where: { email: emailAdmin },
    update: {
      password: hashedAdminPassword,
    },
    create: {
      email: emailAdmin,
      name: 'Admin Default',
      age: 30,
      password: hashedAdminPassword,
      role: 'admin',
    },
  });

  const randomUsers = [
    { email: 'juan.perez@example.com', name: 'Juan Pérez', age: 28 },
    { email: 'maria.gonzalez@example.com', name: 'María González', age: 32 },
    {
      email: 'carlos.rodriguez@example.com',
      name: 'Carlos Rodríguez',
      age: 24,
    },
    { email: 'ana.martinez@example.com', name: 'Ana Martínez', age: 29 },
    { email: 'pedro.sanchez@example.com', name: 'Pedro Sánchez', age: 35 },
  ];

  const defaultPassword = await bcrypt.hash('user123', 10);

  const createdUsers = await Promise.all(
    randomUsers.map((userData) =>
      prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          name: userData.name,
          age: userData.age,
          password: defaultPassword,
          role: 'user',
        },
      }),
    ),
  );

  console.log('Seed completado:', {
    user,
    admin,
    randomUsersCreated: createdUsers.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
