import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create default stages
    const stages = [
        { name: 'Info Cargada', order: 1 },
        { name: 'Calificado', order: 2 },
        { name: 'Referido', order: 3 },
        { name: 'Contratado', order: 4 },
    ]

    for (const stage of stages) {
        const id = stage.name.toLowerCase().replace(' ', '-')
        await prisma.stage.upsert({
            where: { id },
            update: {},
            create: {
                id,
                name: stage.name,
                order: stage.order,
            },
        })
        console.log(`  ✓ Created stage: ${stage.name}`)
    }

    console.log('✅ Seeding complete!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
