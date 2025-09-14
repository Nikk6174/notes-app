import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10)

  const acmeTenant = await prisma.tenant.upsert({
    where: { name: 'Acme' },
    update: {},
    create: {
      name: 'Acme',
      subscription: 'free',
    },
  })

  const globexTenant = await prisma.tenant.upsert({
    where: { name: 'Globex' },
    update: {},
    create: {
      name: 'Globex',
      subscription: 'free',
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@acme.test' },
    update: {},
    create: {
      email: 'admin@acme.test',
      password: hashedPassword,
      role: 'admin',
      tenantId: acmeTenant.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@acme.test' },
    update: {},
    create: {
      email: 'user@acme.test',
      password: hashedPassword,
      role: 'member',
      tenantId: acmeTenant.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@globex.test' },
    update: {},
    create: {
      email: 'admin@globex.test',
      password: hashedPassword,
      role: 'admin',
      tenantId: globexTenant.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@globex.test' },
    update: {},
    create: {
      email: 'user@globex.test',
      password: hashedPassword,
      role: 'member',
      tenantId: globexTenant.id,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })