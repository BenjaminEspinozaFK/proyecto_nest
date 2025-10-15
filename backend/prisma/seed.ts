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
