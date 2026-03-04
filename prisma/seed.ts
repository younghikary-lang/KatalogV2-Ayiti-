import { PrismaClient } from '@prisma/client'
import { MOCK_PRODUCTS } from '../src/lib/mock-data'
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash("A.Dream.For.Me", 10);

    // Master Admin explicit creation
    await prisma.user.upsert({
        where: { id: 'master_admin' },
        update: {
            email: 'young.hikary@gmail.com',
            password: hashedPassword,
            role: 'admin',
            active: true
        },
        create: {
            id: 'master_admin',
            email: 'young.hikary@gmail.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'admin',
            active: true,
        },
    })

    // Legacy mock roles (driver, client)
    await prisma.user.upsert({
        where: { id: '2' },
        update: {},
        create: {
            id: '2',
            name: 'Livreur',
            role: 'driver',
            active: true,
        },
    })

    await prisma.user.upsert({
        where: { id: '3' },
        update: {},
        create: {
            id: '3',
            name: 'Client',
            role: 'client',
            active: true,
        },
    })

    // Extract unique categories and upsert them first
    const uniqueCategories = new Map();
    for (const product of MOCK_PRODUCTS) {
        if (!uniqueCategories.has(product.categoryId) && product.categoryRef) {
            uniqueCategories.set(product.categoryId, product.categoryRef);
        }
    }

    for (const [catId, catRef] of uniqueCategories) {
        await prisma.category.upsert({
            where: { id: catId },
            update: { name: catRef.name, slug: catRef.slug },
            create: { id: catId, name: catRef.name, slug: catRef.slug }
        });
    }

    for (const product of MOCK_PRODUCTS) {
        await prisma.product.upsert({
            where: { id: product.id },
            update: {
                name: product.name,
                price: product.price,
                description: product.description,
                image: product.image,
                categoryRef: { connect: { id: product.categoryId } },
                isNew: product.isNew,
                stock: product.stock || 50,
            },
            create: {
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                image: product.image,
                categoryRef: { connect: { id: product.categoryId } },
                isNew: product.isNew,
                stock: product.stock || 50,
            }
        });
    }

    console.log('Mock users and products seeded successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
